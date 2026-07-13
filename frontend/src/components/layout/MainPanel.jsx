import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, List as ListIcon, Search, X } from "lucide-react";
import { filesApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import VideoCard from "@/components/video/VideoCard";
import VideoRow from "@/components/video/VideoRow";
import VideoPlayer from "@/components/video/VideoPlayer";
import EmptyState from "@/components/video/EmptyState";
import { cx } from "@/lib/format";

const MainPanel = () => {
  const { selectedFolderId, selectedVideoId, closeVideo, settings } = useStore();
  const [view, setView] = useState("grid");
  const [q, setQ] = useState("");

  const { data: folders = [] } = useQuery({ queryKey: ["folders"], queryFn: filesApi.folders });
  const currentFolder = folders.find((f) => f.id === selectedFolderId);
  const path = currentFolder?.path || "/";

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["videos", selectedFolderId, q],
    queryFn: () => filesApi.videos(selectedFolderId, q || undefined),
  });

  const stats = useMemo(() => {
    const s = { total: videos.length, completed: 0, processing: 0, error: 0, unprocessed: 0 };
    for (const v of videos) s[v.status] = (s[v.status] || 0) + 1;
    return s;
  }, [videos]);

  // If video is selected -> show player
  if (selectedVideoId) {
    return <VideoPlayer videoId={selectedVideoId} onClose={closeVideo} />;
  }

  // If onboarding not done and no server url -> empty onboarding state
  const needsSetup = !settings?.server_url || !settings?.video_root;

  return (
    <div className="flex h-full flex-col bg-app" data-testid="main-panel">
      {/* Breadcrumb / toolbar */}
      <div className="flex h-9 items-center justify-between gap-2 border-b border-app bg-panel px-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[11px] text-muted">
            {path.split("/").filter(Boolean).length === 0 ? "~/videos" : "~/videos" + path}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-[4px] bg-surface px-2 py-1 border border-app w-56">
            <Search className="h-3 w-3 text-muted" />
            <input
              data-testid="video-search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title…"
              className="w-full bg-transparent text-xs text-app placeholder:text-muted outline-none"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="text-muted hover:text-app"
                data-testid="video-search-clear"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="flex items-center rounded-[4px] border border-app bg-surface p-0.5">
            <button
              type="button"
              onClick={() => setView("grid")}
              data-testid="view-grid-btn"
              className={cx(
                "rounded-[3px] p-1 transition-fast",
                view === "grid" ? "bg-surface-hover text-app" : "text-muted hover:text-app"
              )}
              title="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              data-testid="view-list-btn"
              className={cx(
                "rounded-[3px] p-1 transition-fast",
                view === "list" ? "bg-surface-hover text-app" : "text-muted hover:text-app"
              )}
              title="List view"
            >
              <ListIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Header strip */}
      <div className="flex items-baseline justify-between px-6 pt-5 pb-4 border-b border-app grid-noise">
        <div>
          <h1 className="font-heading text-2xl font-bold text-app">
            {currentFolder?.name || "Library"}
          </h1>
          <p className="mt-1 text-xs text-2nd">
            {stats.total} clip{stats.total === 1 ? "" : "s"}
            <span className="mx-2 text-muted">·</span>
            <span className="font-mono text-[11px] text-emerald-500">
              {stats.completed} completed
            </span>
            <span className="mx-2 text-muted">·</span>
            <span className="font-mono text-[11px] text-amber-500">
              {stats.processing} processing
            </span>
            {stats.error > 0 && (
              <>
                <span className="mx-2 text-muted">·</span>
                <span className="font-mono text-[11px] text-red-500">
                  {stats.error} error
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 font-mono text-xs text-muted">Loading library…</div>
        ) : videos.length === 0 && needsSetup ? (
          <EmptyState mode="setup" />
        ) : videos.length === 0 ? (
          <EmptyState mode="empty" folderName={currentFolder?.name} />
        ) : view === "grid" ? (
          <div
            className="grid gap-4 p-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            data-testid="video-grid"
          >
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-[color:var(--border)]" data-testid="video-list">
            {videos.map((v) => (
              <VideoRow key={v.id} video={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPanel;
