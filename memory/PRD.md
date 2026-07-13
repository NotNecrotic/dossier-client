# Dossier — Product Requirements Document

## Original problem statement
Build the complete frontend client for **Dossier**, an AI-powered video
indexing and retrieval application. The client is a desktop-class app that
lets users manage a large personal video library, process videos through an
AI backend, and search their video history in natural language.

Because the sandbox is React + FastAPI + MongoDB (web), the C# engine is
represented by a **FastAPI mock engine** exposing the same API surface. The
frontend contains **no business logic** — it only presents data and forwards
commands to the engine.

## User personas
- **Content creator / archivist** – large personal library (hundreds to
  thousands of videos) they want to search by natural language.
- **Prosumer / developer** – runs their own processing server (Ollama /
  self-hosted) and wants total control over storage & credentials.
- **Tool-oriented power user** – expects VS Code / Resolve level polish,
  keyboard-friendly, dense, dark.

## Core requirements (static)
- Desktop-class 3-panel layout: Explorer / Main / AI Assistant.
- Multi-step onboarding: theme (skippable), server URL + key (required),
  video root folder (required).
- Settings view: Connection, Storage, Processing, Appearance, Application.
- Video library browsing (grid + list), status indicators, AI jump markers
  on player timeline, subtitle overlay, transcript panel.
- Frontend never processes videos, scans filesystems, or handles AI
  workloads — everything goes through `/api/*`.
- Dark by default + light theme + 6 accent colour options.

## Architecture chosen
- **Frontend**: React 19 + Tailwind + shadcn/ui, `react-resizable-panels`,
  React Router 7, React Query for server state, Context for UI/theme state.
- **Backend (mock C# engine)**: FastAPI + Motor/MongoDB, seeded on startup
  with 9 folders / 16 videos / default settings.
- **Design tokens**: CSS variables scoped by `.theme-dark` / `.theme-light`
  on `<body>`. Accent colours set six `--accent-*` variables dynamically.
- **Typography**: Chivo (headings), IBM Plex Sans (body), JetBrains Mono
  (numbers, timestamps, paths) via Google Fonts @import.
- **API surface** (`/api`): `settings`, `server/test`, `files/folders`,
  `files/videos`, `video/{id}`, `video/{id}/subtitles`, `ai/query`, `health`.

## What's been implemented (2026-02)
- Backend mock engine with all endpoints and seed data.
- Titlebar with engine health + server host + CPU indicator, safely handles
  invalid URLs.
- 3-panel resizable workspace with collapsible Explorer and AI panels.
- Explorer folder tree (iterative render), search filter, status counts.
- Video grid + list views with status pills, hover play overlay, duration
  badges, metadata.
- Video player: play/pause, skip, volume, fullscreen, timeline with **AI
  jump markers**, subtitle overlay, transcript sidebar with click-to-seek.
- AI Assistant chat: mocked keyword search over the seeded videos, hits
  render as clickable timestamped chips that open the player and seek.
- Multi-step onboarding modal (3 steps, required validation, live theme
  preview, connection test).
- Settings view with commit-on-blur text inputs, sliders, toggles, theme
  and accent swatches; hot-swaps CSS variables live.
- Home landing page (added by testing agent) with hero-style search that
  opens the workspace at the first AI hit.
- Comprehensive `data-testid` coverage across every interactive element.
- Backend + frontend green in `iteration_2.json`.

## Prioritised backlog
### P1
- Real Ollama connection for `/api/ai/query` (replace keyword mock with an
  HTTP call to the configured processing server; env-configurable).
- Debounced folder-tree drag-to-resize width persistence across sessions.
- Command palette (Cmd+K) for global navigation and jump-to-video.

### P2
- Multiple processing servers with per-server status pills.
- Cloud sync for settings.
- Plugin/extension surface for custom index pipelines.
- Background indexing progress in the title bar (aggregate percentage).
- User accounts / access control.
- Advanced search filters (duration, status, folder tags).
- Drag & drop of files/folders into the Explorer to enqueue processing.
- Keyboard shortcut hints and a shortcuts help overlay.

## Notes for future contributors
- Any new backend route MUST live under `/api`.
- Only `MONGO_URL` + `REACT_APP_BACKEND_URL` env vars are used at runtime.
- Never store sensitive keys client-side; always PUT to `/api/settings`.
- New settings fields: add to `Settings` + `SettingsUpdate` pydantic
  models on backend, and to the `SettingsView` on frontend.
- Extend `applyThemeVars()` in `store.jsx` if you add new design tokens.
