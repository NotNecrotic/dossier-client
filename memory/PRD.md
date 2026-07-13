# Dossier — Frontend Client

## Original Problem Statement
Build a complete desktop-class client for **Dossier** — an AI-powered video indexing and retrieval application. The client browses a large personal video library, delegates AI workloads to a remote processing server (Ollama-compatible), and lets the user search their video history in natural language. Reference feel: Visual Studio Code / DaVinci Resolve / Unreal Engine editor. Must NOT process videos, scan files, store credentials insecurely, or contain business logic — that all lives in the local C# engine (mocked here as FastAPI).

## User Choices (verbatim)
- "dark theme by default with a toggle for light. also an option to change the accent color."
- "lets focus more on modern ui than a specific software like vscode or resolve. it needs to be unique feel."
- "the app pulls videos from the users computer starting from the root directory (set in settings)"
- AI eventually connects to user's own Ollama cloud LLM
- Onboarding: multi-step, **server URL required**, **video folder required**, theme step skippable
- Second-pass direction: purple/violet aesthetic with a hero landing page ("THE DOSSIER" wordmark, glowy search input, Explore Workspace pill button)

## Architecture
- **Frontend** — React 19 + Tailwind + shadcn/ui + `@tanstack/react-query` + `react-resizable-panels`. Purple `Amethyst` accent default, dark theme, six user-selectable accents (Sapphire / Amethyst / Emerald / Ruby / Amber / Slate).
- **Backend** — FastAPI mock of the local C# engine, MongoDB for settings + seeded folders/videos.
- **Routes** — `/` = HomePage (hero landing), `/workspace` = 3-panel workspace, `/settings` = Settings.
- **API layer** — centralised in `/app/frontend/src/lib/api.js` (settingsApi / filesApi / videoApi / aiApi / serverApi / engineApi). No API calls scattered in UI.
- **Store** — `StoreProvider` context in `lib/store.jsx` manages settings, theme/accent CSS vars, selected folder/video, panel collapse state, and video seek target.

## Implemented (2026-02)
### Backend endpoints (all `/api`)
- `GET /health` · `GET /settings` · `PUT /settings` (validates & normalises server_url)
- `POST /server/test` (mock reachability)
- `GET /files/folders` (with recursive video counts) · `GET /files/videos?folder_id&q`
- `GET /video/{id}` · `GET /video/{id}/subtitles` (generated cues)
- `POST /ai/query` (deterministic keyword search — Ollama swappable behind this route)
- Seeded 9 folders + 16 videos referencing public sample MP4s.

### Frontend
- **HomePage** — "THE DOSSIER" wordmark, purple gradient DossierMark, glowy pill search, Explore Workspace + gear buttons, ambient purple radial glows.
- **Onboarding modal** — 3 steps with progress dots, theme+accent (skippable), server URL + optional key + Test button (required), video root folder (required). Persists via PUT /settings.
- **Workspace (3-panel resizable)**
  - Explorer: iterative folder tree, expand/collapse, filter, folder counts.
  - Main: breadcrumb + toolbar, view grid/list, search, stat strip (Indexed / Processing / Error), video cards & rows.
  - AI Assistant: chat with suggestion chips, /api/ai/query, clickable hits that open player at timestamp.
- **Video Player** — sample MP4 playback, custom timeline with AI jump markers, subtitle overlay, transcript sidebar (clickable cues).
- **Settings** — Connection / Storage / Processing / Appearance / Application. Text inputs commit on blur/Enter (no keystroke clearing). Test connection. Theme + accent swatches applied instantly to CSS variables.
- **TitleBar** — Home / Workspace / Settings nav, engine + server + CPU indicators. Crash-safe against malformed URLs.

## Tested
- Backend 19/19 pytest suite (all endpoints incl. URL normalisation) — PASS
- Frontend E2E (testing agent iteration 3) — 100% PASS
  - HomePage hero + search-navigate flow
  - Onboarding gating & step validation
  - 3-panel workspace, folder filtering, video card → player
  - AI query → hit → player seek
  - Settings sections, theme + accent switching
  - Cross-navigation & 404 → `/`

## Backlog (P2 — optional polish)
- Backend: Pydantic range validators for `cpu_limit` / `upload_limit_mbps` / `frame_sampling`.
- Swap `/ai/query` mock for a real Ollama HTTP call when server URL + key are set.
- Real filesystem scanning would be added when integrating the actual C# engine.
- Command palette (Cmd/Ctrl-K) for quick navigation.
- Drag/drop to move videos between folders.

## Notes
- No auth. All `/api` endpoints are open — this is intentional; auth would live in the C# engine, not the web frontend.
- Sample MP4s referenced: Big Buck Bunny + Elephants Dream (Google Commondatastorage).
