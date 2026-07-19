# Dossier

> ⚠️ **Work In Progress (WIP)**  
> Dossier is currently in early development. Nothing is considered complete or production-ready yet. Many features are incomplete, unstable, or not yet functional.

## About

Dossier is a video analysis and search platform designed to transform large collections of video files into a searchable knowledge base.

Using AI processing, Dossier can extract information from videos and instantly find them when asked.

Some core systems in this project include:

- Speech transcripts
- Multi-language detection and translation
- OCR text extraction
- Scene understanding
- Semantic search
- Video retrieval and question answering

The goal of Dossier is to make large video archives searchable in the same way you search text documents.

### Example usage

Search your videos using natural language:

> "Find the part where someone explains how the server was configured"

Dossier will locate relevant moments and provide timestamps.

---

## Architecture

Dossier uses a client-server architecture, separating the user interface and local processing from the AI processing.

The **Dossier Client** is a desktop application that manages your local video library, monitors files, handles preprocessing, and communicates securely with a Dossier Server.

The **Dossier Server** handles the heavy processing workloads, including AI analysis, transcription, OCR, embeddings, and search.

> Note: Playback of videos remains local for privacy. The server will only store the processed video data used for AI searching.

---

## Development Setup

> Setup instructions will be added once the project reaches a more stable state.