import { Play } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDuration, formatBytes, formatDate, cx } from "@/lib/format";

const STATUS_COLOR = {
  completed: "#10B981",
  processing: "#F59E0B",
  error: "#EF4444",
  unprocessed: "#A1A1AA",
};

const VideoRow = ({ video }) => {
  const { openVideoAt } = useStore();
  return (
    <button
      type="button"
      data-testid={`video-row-${video.id}`}
      onClick={() => openVideoAt(video.id, 0)}
      className="group flex w-full items-center gap-4 px-6 py-3 text-left transition-fast hover:bg-surface-hover"
    >
      <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-[4px] border border-app bg-panel">
        <img src={video.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-fast group-hover:opacity-100">
          <Play className="h-3.5 w-3.5 fill-white text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm text-app">{video.title}</div>
        <div className="mt-0.5 flex items-center gap-3 font-mono text-[11px] text-muted">
          <span>{video.filename}</span>
          <span>{formatBytes(video.size_bytes)}</span>
          <span>{formatDate(video.modified)}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-2nd">
        <span
          className={cx(
            "flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest",
            video.status === "processing" && "dossier-pulse"
          )}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: STATUS_COLOR[video.status] }}
          />
          {video.status}
        </span>
        <span className="font-mono text-xs text-2nd">{formatDuration(video.duration)}</span>
      </div>
    </button>
  );
};

export default VideoRow;
