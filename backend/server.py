"""
Dossier — Local C# Engine mock (FastAPI)

This service simulates the local client engine that would ordinarily run on
the user's machine (C#/.NET). It exposes REST endpoints matching the Dossier
frontend's expectations:

  /api/settings         GET/PUT
  /api/server/test      POST
  /api/files/folders    GET
  /api/files/videos     GET
  /api/video/{id}       GET
  /api/video/{id}/subtitles GET
  /api/ai/query         POST
"""
from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Dossier Engine (mock)")
api_router = APIRouter(prefix="/api")

# ---------- Models --------------------------------------------------------

VideoStatus = Literal["unprocessed", "processing", "completed", "error"]


class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")

    onboarding_complete: bool = False
    theme: Literal["dark", "light"] = "dark"
    accent: str = "Sapphire"
    server_url: str = ""
    server_key: str = ""
    video_root: str = ""
    cpu_limit: int = 60  # percent
    upload_limit_mbps: int = 20
    frame_sampling: int = 4  # frames/sec sampled
    start_on_boot: bool = False
    tray_mode: bool = True


class SettingsUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    onboarding_complete: Optional[bool] = None
    theme: Optional[Literal["dark", "light"]] = None
    accent: Optional[str] = None
    server_url: Optional[str] = None
    server_key: Optional[str] = None
    video_root: Optional[str] = None
    cpu_limit: Optional[int] = None
    upload_limit_mbps: Optional[int] = None
    frame_sampling: Optional[int] = None
    start_on_boot: Optional[bool] = None
    tray_mode: Optional[bool] = None


class Folder(BaseModel):
    id: str
    name: str
    path: str
    parent_id: Optional[str] = None
    video_count: int = 0


class Video(BaseModel):
    id: str
    folder_id: str
    title: str
    filename: str
    path: str
    duration: int  # seconds
    size_bytes: int
    thumbnail: str
    status: VideoStatus
    modified: str  # ISO date
    stream_url: str


class ServerTest(BaseModel):
    url: str
    key: Optional[str] = None


class AIQuery(BaseModel):
    query: str


class AIHit(BaseModel):
    video_id: str
    video_title: str
    timestamp: int  # seconds
    snippet: str


class AIResponse(BaseModel):
    answer: str
    hits: List[AIHit] = []


# ---------- Seed data -----------------------------------------------------

SAMPLE_STREAM = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
SAMPLE_STREAM_ALT = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"

THUMBS = [
    "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
    "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
    "https://images.unsplash.com/photo-1519638399535-1b036603ac77?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
    "https://images.unsplash.com/photo-1526289034009-0240ddb68ce3?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
    "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
]

FOLDERS_SEED = [
    {"id": "f-root", "name": "Video Library", "path": "/", "parent_id": None},
    {"id": "f-vlogs", "name": "Personal Vlogs", "path": "/Personal Vlogs", "parent_id": "f-root"},
    {"id": "f-vlogs-2024", "name": "2024", "path": "/Personal Vlogs/2024", "parent_id": "f-vlogs"},
    {"id": "f-vlogs-2025", "name": "2025", "path": "/Personal Vlogs/2025", "parent_id": "f-vlogs"},
    {"id": "f-hardware", "name": "Hardware Builds", "path": "/Hardware Builds", "parent_id": "f-root"},
    {"id": "f-tutorials", "name": "Tutorials", "path": "/Tutorials", "parent_id": "f-root"},
    {"id": "f-travel", "name": "Travel", "path": "/Travel", "parent_id": "f-root"},
    {"id": "f-travel-jp", "name": "Japan 2024", "path": "/Travel/Japan 2024", "parent_id": "f-travel"},
    {"id": "f-work", "name": "Work Sessions", "path": "/Work Sessions", "parent_id": "f-root"},
]


def _video(
    vid: str, folder: str, title: str, filename: str, duration: int, status: VideoStatus, idx: int
):
    root = "/mnt/videos"
    folder_map = {f["id"]: f["path"] for f in FOLDERS_SEED}
    path = f"{root}{folder_map[folder]}/{filename}"
    return {
        "id": vid,
        "folder_id": folder,
        "title": title,
        "filename": filename,
        "path": path,
        "duration": duration,
        "size_bytes": duration * 1024 * 1024 * 3,
        "thumbnail": THUMBS[idx % len(THUMBS)],
        "status": status,
        "modified": datetime(2024, 3, 1 + (idx % 27), 10, 0, tzinfo=timezone.utc).isoformat(),
        "stream_url": SAMPLE_STREAM if idx % 2 == 0 else SAMPLE_STREAM_ALT,
    }


VIDEOS_SEED = [
    _video("v-1", "f-hardware", "PC Upgrade — GPU + Cooling", "hardware_build.mp4", 2732, "completed", 0),
    _video("v-2", "f-hardware", "New Case Assembly", "case_assembly.mp4", 1421, "completed", 1),
    _video("v-3", "f-hardware", "Cable Management Tips", "cable_management.mp4", 812, "processing", 2),
    _video("v-4", "f-vlogs-2024", "Studio Tour Update", "studio_tour_2024.mp4", 942, "completed", 3),
    _video("v-5", "f-vlogs-2024", "Year in Review", "year_review_2024.mp4", 1832, "completed", 4),
    _video("v-6", "f-vlogs-2025", "January Recap", "jan_recap_2025.mp4", 621, "unprocessed", 5),
    _video("v-7", "f-vlogs-2025", "Behind the Scenes", "bts_feb.mp4", 741, "error", 6),
    _video("v-8", "f-tutorials", "React Server Components", "rsc_walkthrough.mp4", 2210, "completed", 7),
    _video("v-9", "f-tutorials", "Docker Compose Basics", "docker_basics.mp4", 1541, "completed", 0),
    _video("v-10", "f-tutorials", "PostgreSQL Indexing", "pg_indexing.mp4", 1930, "processing", 1),
    _video("v-11", "f-travel-jp", "Tokyo — Shibuya Night", "tokyo_shibuya.mp4", 542, "completed", 2),
    _video("v-12", "f-travel-jp", "Kyoto Temples", "kyoto_temples.mp4", 1201, "completed", 3),
    _video("v-13", "f-travel-jp", "Osaka Street Food", "osaka_food.mp4", 811, "unprocessed", 4),
    _video("v-14", "f-work", "Product Standup", "standup_0312.mp4", 1832, "completed", 5),
    _video("v-15", "f-work", "Design Review Q2", "design_review_q2.mp4", 3241, "completed", 6),
    _video("v-16", "f-work", "Retrospective", "retro_march.mp4", 2103, "processing", 7),
]


async def ensure_seed():
    if await db.folders.count_documents({}) == 0:
        await db.folders.insert_many([dict(f) for f in FOLDERS_SEED])
    if await db.videos.count_documents({}) == 0:
        await db.videos.insert_many([dict(v) for v in VIDEOS_SEED])
    if await db.settings.count_documents({}) == 0:
        await db.settings.insert_one(Settings().model_dump())


# ---------- Routes --------------------------------------------------------


@api_router.get("/health")
async def health():
    return {"status": "ok", "engine": "dossier-mock", "version": "1.0.0"}


@api_router.get("/settings", response_model=Settings)
async def get_settings():
    doc = await db.settings.find_one({}, {"_id": 0})
    if not doc:
        s = Settings()
        await db.settings.insert_one(s.model_dump())
        return s
    return Settings(**doc)


@api_router.put("/settings", response_model=Settings)
async def update_settings(patch: SettingsUpdate):
    updates = {k: v for k, v in patch.model_dump().items() if v is not None}
    if updates:
        await db.settings.update_one({}, {"$set": updates}, upsert=True)
    doc = await db.settings.find_one({}, {"_id": 0})
    return Settings(**doc)


@api_router.post("/server/test")
async def test_server(body: ServerTest):
    """
    Mock: URL considered reachable if it starts with http(s) and contains a dot.
    """
    url = (body.url or "").strip()
    ok = url.startswith(("http://", "https://")) and "." in url
    return {
        "ok": ok,
        "url": url,
        "latency_ms": random.randint(38, 220) if ok else None,
        "message": "Handshake successful" if ok else "Could not reach processing server",
    }


def _compute_video_counts(folders, videos):
    """Recursively sum videos per folder including descendants."""
    by_parent = {}
    for f in folders:
        by_parent.setdefault(f["parent_id"], []).append(f)

    direct = {}
    for v in videos:
        direct[v["folder_id"]] = direct.get(v["folder_id"], 0) + 1

    counts = {}

    def walk(fid):
        total = direct.get(fid, 0)
        for child in by_parent.get(fid, []):
            total += walk(child["id"])
        counts[fid] = total
        return total

    for root in by_parent.get(None, []):
        walk(root["id"])
    return counts


@api_router.get("/files/folders", response_model=List[Folder])
async def list_folders():
    folders = await db.folders.find({}, {"_id": 0}).to_list(1000)
    videos = await db.videos.find({}, {"_id": 0, "folder_id": 1}).to_list(10000)
    counts = _compute_video_counts(folders, videos)
    return [Folder(**{**f, "video_count": counts.get(f["id"], 0)}) for f in folders]


@api_router.get("/files/videos", response_model=List[Video])
async def list_videos(folder_id: Optional[str] = None, q: Optional[str] = None):
    query: dict = {}
    if folder_id and folder_id != "f-root":
        # include descendant folders
        folders = await db.folders.find({}, {"_id": 0}).to_list(1000)
        wanted = {folder_id}
        changed = True
        while changed:
            changed = False
            for f in folders:
                if f["parent_id"] in wanted and f["id"] not in wanted:
                    wanted.add(f["id"])
                    changed = True
        query["folder_id"] = {"$in": list(wanted)}
    if q:
        query["title"] = {"$regex": q, "$options": "i"}
    docs = await db.videos.find(query, {"_id": 0}).to_list(5000)
    return [Video(**d) for d in docs]


@api_router.get("/video/{video_id}", response_model=Video)
async def get_video(video_id: str):
    doc = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Video not found")
    return Video(**doc)


@api_router.get("/video/{video_id}/subtitles")
async def get_subtitles(video_id: str):
    doc = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Video not found")
    duration = doc["duration"]
    # Generate deterministic mock subtitle cues
    lines = [
        "Welcome back to the channel.",
        "Today we're going to walk through the entire process.",
        "Let's start by taking a look at the components.",
        "This is the part I've been most excited about.",
        "You can see the difference right away.",
        "I want to talk about upgrading my PC for a second.",
        "The results honestly exceeded my expectations.",
        "Let me know what you think in the comments.",
    ]
    cues = []
    step = max(30, duration // len(lines))
    for i, text in enumerate(lines):
        start = i * step
        if start >= duration:
            break
        cues.append({"start": start, "end": min(start + step, duration), "text": text})
    return {"video_id": video_id, "cues": cues}


AI_KEYWORDS = {
    "upgrade": ["v-1", "v-3"],
    "pc": ["v-1", "v-3"],
    "gpu": ["v-1"],
    "cable": ["v-3"],
    "cooling": ["v-1"],
    "case": ["v-2"],
    "studio": ["v-4"],
    "review": ["v-5", "v-15"],
    "recap": ["v-6", "v-5"],
    "react": ["v-8"],
    "docker": ["v-9"],
    "postgres": ["v-10"],
    "database": ["v-10"],
    "tokyo": ["v-11"],
    "kyoto": ["v-12"],
    "osaka": ["v-13"],
    "food": ["v-13"],
    "japan": ["v-11", "v-12", "v-13"],
    "standup": ["v-14"],
    "design": ["v-15"],
    "retro": ["v-16"],
}


@api_router.post("/ai/query", response_model=AIResponse)
async def ai_query(body: AIQuery):
    """
    Mock semantic search over the video library. Structured so a real Ollama
    endpoint can be swapped in behind this route later.
    """
    q = (body.query or "").lower().strip()
    if not q:
        return AIResponse(answer="Please enter a query.", hits=[])
    matched_ids: List[str] = []
    for kw, ids in AI_KEYWORDS.items():
        if kw in q:
            for vid in ids:
                if vid not in matched_ids:
                    matched_ids.append(vid)
    hits: List[AIHit] = []
    if not matched_ids:
        # Fuzzy fallback: match on video title
        docs = await db.videos.find({}, {"_id": 0}).to_list(5000)
        for d in docs:
            if any(tok in d["title"].lower() for tok in q.split() if len(tok) > 2):
                matched_ids.append(d["id"])
    for vid in matched_ids[:4]:
        doc = await db.videos.find_one({"id": vid}, {"_id": 0})
        if not doc:
            continue
        # Deterministic pseudo-random timestamp
        ts = int((hash(vid + q) % max(1, doc["duration"] - 30)))
        hits.append(
            AIHit(
                video_id=doc["id"],
                video_title=doc["title"],
                timestamp=ts,
                snippet=f"...matched context around {ts}s in {doc['title']}...",
            )
        )
    if hits:
        first = hits[0]
        mm, ss = divmod(first.timestamp, 60)
        answer = f'Found it at {mm:02d}:{ss:02d} in "{first.video_title}".'
        if len(hits) > 1:
            answer += f" Also found {len(hits) - 1} related result{'s' if len(hits) - 1 > 1 else ''}."
    else:
        answer = "I could not find a matching clip in your library."
    return AIResponse(answer=answer, hits=hits)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    await ensure_seed()
    logger.info("Dossier engine mock ready.")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
