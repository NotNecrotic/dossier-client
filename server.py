import os
import json
import re
from urllib.parse import unquote
from aiohttp import web
import chromadb

# =====================================================================
# ⚙️ OLLAMA CONNECTION CONFIGURATION
# =====================================================================
# Set to "local" to use the engine on this machine.
# Set to "remote" to route traffic to another machine on your local network.
OLLAMA_MODE = os.environ.get("OLLAMA_MODE", "local") 
REMOTE_OLLAMA_HOST = os.environ.get("REMOTE_OLLAMA_HOST", "http://192.168.68.71:11434")

if OLLAMA_MODE == "remote":
    from ollama import Client
    print(f"[Ollama Init] Operating in REMOTE mode. Target Host: {REMOTE_OLLAMA_HOST}")
    ollama_client = Client(host=REMOTE_OLLAMA_HOST)
else:
    import ollama as ollama_client
    print("[Ollama Init] Operating in LOCAL default mode.")

# =====================================================================
# 📂 SYSTEM DIRECTORY & DATABASE CONFIGURATION
# =====================================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HTML_DIR = os.path.join(BASE_DIR, '')  
STATIC_DIR = os.path.join(BASE_DIR, 'assets')
VIDEO_DIR = os.path.join(BASE_DIR, 'DOSSIER')    
FILES_JSON_PATH = os.path.join(BASE_DIR, 'metadata/metadata.json')
SUBTITLES_DIR = os.path.join(BASE_DIR, 'metadata/subtitles')

os.makedirs(VIDEO_DIR, exist_ok=True)

# Initialize ChromaDB Vector Instance
# Adjust this path if your vector database is located in a different directory
CHROMA_DB_PATH = "/mnt/data/DOSSIER/chroma_db"
if os.path.exists(CHROMA_DB_PATH) or True: # Keeps initialization stable
    try:
        chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
        collection = chroma_client.get_or_create_collection("speech_map")
        print(f"[Database Init] Successfully connected to ChromaDB storage at: {CHROMA_DB_PATH}")
    except Exception as db_err:
        print(f"[Database Error] Could not mount ChromaDB client instance: {db_err}")

app = web.Application()

# =====================================================================
# 🧠 EXTRACTED PIPELINE LOGIC (PLANNER & RETRIEVER INTEGRATION)
# =====================================================================
def build_queries(question):
    """Integrated from planner.py - Generates clean semantic tokens."""
    prompt = f"""You are a lean search query generator for conversational video transcripts. 

Your task is to extract only the core keywords, entities, and important details from the input and return them as a clean list of queries. Strip out all conversational filler words.

RULES:
1. If the input is already a short keyword or phrase, return it exactly verbatim.
2. If the user wraps text in quotes, extract that exact quoted text.
3. Otherwise, break the core subjects down into short, raw search phrases.

GOOD:
- butterfly
- graphics card
- japan visit

BAD:
- what did he say about his graphics card
- a conversation about visiting japan

Input: {question}

Return only as many queries as relevant (one per line). Less queries is better.
No explanations, numbers, quotes, or markdown."""

    res = ollama_client.chat(
        model="llama3.2",
        options={"temperature": 0.1}, # Added for deterministic query stripping
        messages=[{"role": "user", "content": prompt}]
    )

    text = res["message"]["content"]
    return [q.strip("- ").strip() for q in text.split("\n") if q.strip()]


def search_all(queries, k=5):
    """Integrated from retriever.py - Scans vector spaces with unique deduplication hooks."""
    results = []
    seen_ids = set() 

    for q in queries:
        try:
            res = collection.query(
                query_texts=[q],
                n_results=k,
                include=["documents", "metadatas"]
            )
        except Exception as query_err:
            print(f"[Chroma Query Fail] Failed to evaluate search tokens '{q}': {query_err}")
            continue

        if not res or not res.get("documents") or not res["documents"][0]:
            continue

        documents = res["documents"][0]
        metadatas = res["metadatas"][0]
        ids = res.get("ids", [[]])[0]  

        for i, (doc, meta) in enumerate(zip(documents, metadatas)):
            segment_id = ids[i] if i < len(ids) else f"{doc}_{meta.get('start')}"
            
            if segment_id in seen_ids:
                continue
                
            seen_ids.add(segment_id)
            results.append((doc, meta))

    return results

# --- Helper: Memory Context Formatting ---
def format_context(results):
    """Formats retrieved vector segments into timestamped reference paragraphs."""
    context = []
    for text, meta in results:
        start_time_raw = meta.get('start', 0.0)
        source_file = meta.get('source_file') or meta.get('source') or 'Unknown File'
        
        # 1. Convert to a clean integer for tracking and jumps
        total_seconds = int(float(start_time_raw))
        
        # 2. Calculate clean clock time directly in Python
        mins, secs = divmod(total_seconds, 60)
        hours, mins = divmod(mins, 60)
        
        if hours > 0:
            readable_time = f"{hours:02d}:{mins:02d}:{secs:02d}"
        else:
            readable_time = f"{mins:02d}:{secs:02d}"
            
        # 3. Present it to the AI perfectly structured so it can't mess up formatting
        context.append(
            f"[File: {source_file} | Time: {readable_time} | JumpSeconds: {total_seconds}] {text}"
        )
        
    return "\n".join(context)

# =====================================================================
# 🕸️ CORE INTERACTIVE WEB ROUTER REQUEST HANDLERS
# =====================================================================
async def serve_index(request):
    return web.FileResponse(os.path.join(HTML_DIR, 'index.html'))

async def handle_chat_query(request):
    """Processes natural language inquiries via dual-mode Ollama infrastructure."""
    try:
        data = await request.json()
        user_message = data.get("message", "").strip()
        
        if not user_message:
            return web.json_response({"textResponse": "Query payload was empty."}, status=400, headers={"Access-Control-Allow-Origin": "*"})

        # STEP 1: Process keywords or questions using integrated planner logic
        queries = build_queries(user_message)
        print(f"\n[RAG Pipeline] Processing UI query: \"{user_message}\"")
        for q in queries:
            print(f"  -> Generated sub-query: {q}")

        # STEP 2: Query integrated ChromaDB vector memory layer
        results = search_all(queries)

        # Deduplicate incoming transcript text content fragments
        seen = set()
        unique_results = []
        for r in results:
            if r[0] not in seen:
                unique_results.append(r)
                seen.add(r[0])

        # Convert clock math in Python layout
        formatted_memory_context = format_context(unique_results)

        # STEP 3: Construct precise layout structural prompt blueprint
        system_prompt = f"""You are a helpful, technical video workspace peer. Your goal is to help the user recall exact details from their recorded audio history.

CRITICAL FORMATTING RULES:
1. RESPONSE STYLE: Write a nice, short phrase or single sentence that directly answers the user's question. Do not include markdown tables, lists, or long summaries.
2. JUMP AUTOMATION: At the very end of your response, on a brand new line, you must output the exact ACTION_JUMP line using the raw integer value from 'JumpSeconds'.

OUTPUT STRUCTURE COMPLIANCE:
Your response must strictly match this exact layout:

[Insert your short phrase/sentence answering the question here] at [Insert time here] in [Insert video file here].

ACTION_JUMP: filename | JumpSeconds_integer | Reason: brief explanation

Question:
{user_message}

Memory:
{formatted_memory_context}
"""

        # STEP 4: Submit contextual system layer query to custom configured Ollama Client
        print(f"[Ollama Inference] Routing synthesis request via model: llama3.1 (Execution Mode: {OLLAMA_MODE})...")
        response = ollama_client.chat(
            model="llama3.2",
            options={"temperature": 0.1}, # Added to stop structure drift on synthesis
            messages=[{"role": "user", "content": system_prompt}]
        )
        
        ai_raw_output = response["message"]["content"]
        
        payload = {
            "textResponse": ai_raw_output, 
            "actionRequired": False, 
            "mediaPayload": None
        }
        
        # STEP 5: Parse structural automation codes to trigger live front-end timeline snaps
        if "ACTION_JUMP:" in ai_raw_output:
            try:
                parts_str = ai_raw_output.split("ACTION_JUMP:")[1].strip()
                parts = parts_str.split("|")
                
                if len(parts) >= 2:
                    filename = parts[0].strip().replace('[', '').replace(']', '')
                    filepath = None

                    if os.path.exists(FILES_JSON_PATH):
                        try:
                            with open(FILES_JSON_PATH, 'r', encoding='utf-8') as f:
                                files_metadata = json.load(f)
                                file_info = files_metadata.get(filename)
                                if file_info:
                                    filepath = file_info.get('path')
                        except Exception as meta_err:
                            print(f"[Metadata Lookup Warning] Failed to load metadata for '{filename}': {meta_err}")

                    seconds_raw = parts[1].strip().lower().replace('s', '').replace('sec', '')
                    seconds = int(float(seconds_raw)) 
                    
                    reason = "Located Scene"
                    if len(parts) > 2 and "Reason:" in parts[2]:
                        reason = parts[2].replace("Reason:", "").strip()
                    
                    payload["textResponse"] = ai_raw_output.split("ACTION_JUMP:")[0].strip()
                    payload["actionRequired"] = True
                    payload["mediaPayload"] = {
                        "videoFileUrl": f"/api/video/{filepath}", 
                        "jumpToSeconds": seconds,
                        "sceneReason": reason,
                        "fileName": filename,
                        "filePath": filepath
                    }
                    print(f"[RAG Success] Issuing timeline snap hook to UI: {filename} at {seconds}s (path={filepath})")
            except Exception as parse_err:
                print(f"Warning: Failed to extract structural action data properties: {parse_err}")
                
        return web.json_response(payload, headers={"Access-Control-Allow-Origin": "*"})
    except Exception as e:
        print(f"Server RAG Error: {str(e)}")
        return web.json_response({"textResponse": f"Backend processing error: {str(e)}"}, status=500, headers={"Access-Control-Allow-Origin": "*"})

async def handle_options(request):
    return web.Response(headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    })

def sync_metadata_with_db():
    updated_db = {}
    
    # 1. Fetch all source_files from ChromaDB
    indexed_data = collection.get(include=["metadatas"])
    indexed_files = set()
    if indexed_data and 'metadatas' in indexed_data:
        for meta in indexed_data['metadatas']:
            if meta and 'source_file' in meta:
                # Add the base filename to the set for easy lookup
                indexed_files.add(os.path.basename(meta['source_file']))
    
    # 2. Walk the directory tree recursively
    for root, dirs, files in os.walk(VIDEO_DIR):
        for file in files:
            if file.lower().endswith(('.mp4', '.mkv', '.webm')):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, VIDEO_DIR).replace('\\', '/')
                
                # Check for .txt subtitle existence
                file_name_only = os.path.splitext(file)[0]
                txt_path = os.path.join(SUBTITLES_DIR, f"{file_name_only}.txt")
                print(txt_path)
                has_subtitles = os.path.exists(txt_path)
                
                # Check if this file name is in the set of indexed files
                has_metadata = (file in indexed_files)
                
                # Use the filename as the key
                updated_db[file] = {
                    "path": rel_path, # Still keep the full path for the player to use
                    "has_subtitles": has_subtitles,
                    "subtitle_path": f"/api/subtitles/{file_name_only}.txt" if has_subtitles else None,
                    "has_metadata": has_metadata
                }
    
    os.makedirs(os.path.dirname(FILES_JSON_PATH), exist_ok=True)
    with open(FILES_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(updated_db, f, indent=4)
        
    print(f"[Sync] Scan complete. Found {len(updated_db)} unique filenames. Indexed in DB: {sum(1 for e in updated_db.values() if e['has_metadata'])}")

async def list_files(request):
    sync_metadata_with_db()  # Ensure metadata is fresh
    try:
        sub_dir = request.query.get('path', '').strip('/')
        target_dir = os.path.abspath(os.path.join(VIDEO_DIR, sub_dir))
        
        if not target_dir.startswith(os.path.abspath(VIDEO_DIR)):
            return web.json_response({"error": "Access Denied"}, status=403, headers={"Access-Control-Allow-Origin": "*"})
            
        if not os.path.exists(target_dir):
            return web.json_response({"error": "Directory not found"}, status=404, headers={"Access-Control-Allow-Origin": "*"})

        # Load the new dictionary-based metadata
        metadata_db = {}
        if os.path.exists(FILES_JSON_PATH):
            try:
                with open(FILES_JSON_PATH, 'r', encoding='utf-8') as f:
                    metadata_db = json.load(f) # Now expects { "filename.mkv": {...} }
            except Exception as json_err:
                print(f"Warning: Failed to parse files.json: {json_err}")

        items = []
        for entry in os.scandir(target_dir):
            rel_path = os.path.relpath(entry.path, VIDEO_DIR).replace('\\', '/')
            
            if entry.is_dir():
                items.append({
                    "name": entry.name,
                    "type": "directory",
                    "path": rel_path
                })
            elif entry.is_file() and entry.name.lower().endswith(('.mp4', '.mkv', '.webm')):
                # Use entry.name (the filename) to lookup in the new dictionary
                file_metadata = metadata_db.get(entry.name, None)
                
                items.append({
                    "name": entry.name,
                    "type": "video",
                    "path": rel_path,
                    "size_mb": round(os.path.getsize(entry.path) / (1024 * 1024), 2),
                    "metadata": file_metadata  # Now contains {has_subtitles, subtitle_path, has_metadata}
                })
                
        items.sort(key=lambda x: (x['type'] != 'directory', x['name'].lower()))
        
        payload = {
            "currentPath": sub_dir,
            "items": items
        }
        return web.json_response(payload, headers={"Access-Control-Allow-Origin": "*"})
    except Exception as e:
        return web.json_response({"error": f"Disk scan breakdown: {str(e)}"}, status=500, headers={"Access-Control-Allow-Origin": "*"})

async def stream_video(request):
    """Streams local files directly using chunked block ranges to allow timeline scrubbing."""
    video_rel_path = request.match_info.get('filename')
    video_path = os.path.abspath(os.path.join(VIDEO_DIR, video_rel_path))
    
    if not video_path.startswith(os.path.abspath(VIDEO_DIR)):
        return web.Response(status=403, text="Access Denied")

    if not os.path.exists(video_path) or not os.path.isfile(video_path):
        return web.Response(status=404, text="Video file not found")

    response = web.FileResponse(video_path)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

def convert_to_vtt(text):
    vtt_output = ["WEBVTT\n"]
    
    # Regex to capture [start - end] text
    pattern = re.compile(r"\[([\d\.]+) - ([\d\.]+)\] (.*)")
    
    for line in text.splitlines():
        match = pattern.match(line)
        if match:
            start, end, content = match.groups()
            
            # Helper to convert seconds to HH:MM:SS.mmm
            def format_ts(seconds):
                total_ms = int(float(seconds) * 1000)
                ms = total_ms % 1000
                total_s = total_ms // 1000
                h, m = divmod(total_s // 60, 60)
                s = total_s % 60
                return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"
            
            vtt_output.append(f"{format_ts(start)} --> {format_ts(end)}\n{content}\n")
    
    return "\n".join(vtt_output)

async def stream_subtitles(request):
    filename = unquote(request.match_info.get('filename'))
    txt_path = os.path.join(SUBTITLES_DIR, filename)
    
    if not os.path.exists(txt_path):
        return web.Response(status=404, text="Subtitle file not found.")

    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Convert the file content on-the-fly
    vtt_content = convert_to_vtt(content)

    return web.Response(
        text=vtt_content,
        content_type="text/vtt",
        headers={"Access-Control-Allow-Origin": "*"}
    )

# =====================================================================
# 🧭 SERVICE ROUTE REGISTRATIONS
# =====================================================================
app.router.add_get('/', serve_index)
app.router.add_post('/api/chat', handle_chat_query)
app.router.add_options('/api/chat', handle_options)
app.router.add_get('/api/files', list_files)
app.router.add_get('/api/video/{filename:.*}', stream_video)
app.router.add_get('/api/subtitles/{filename:.*}', stream_subtitles) 

if os.path.exists(STATIC_DIR):
    app.router.add_static('/assets/', path=STATIC_DIR, name='static')

if __name__ == '__main__':
    print("Starting THE DOSSIER Central Router...")
    web.run_app(app, host='0.0.0.0', port=8000)
