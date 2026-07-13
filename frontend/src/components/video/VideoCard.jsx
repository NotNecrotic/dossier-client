import { Play, Clock } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDuration, formatDate, cx } from "@/lib/format";

const STATUS_STYLE = {
  completed:   { color: "#10B981", label: "Indexed" },
  processing:  { color: "#F59E0B", label: "Processing" },
  error:       { color: "#EF4444", label: "Error" },
  unprocessed: { color: "#A1A1AA", label: "Not indexed" },
};

const VideoCard = ({ video }) => {
  const { openVideoAt } = useStore();
  const s = STATUS_STYLE[video.status] || STATUS_STYLE.unprocessed;

  return (
    <button
      type="button"
      data-testid={`video-card-${video.id}`}
      onClick={() => openVideoAt(video.id, 0)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-app bg-surface text-left transition-fast hover:border-strong hover:bg-surface-hover hover:-translate-y-0.5 hover:shadow-[0_8px_28px_var(--accent-glow)]"
    >
      <div className="relative aspect-video overflow-hidden bg-panel">
        <img
          src={video.thumbnail}
          alt=""
          className="h-full w-full object-cover transition-fast group-hover:scale-[1.02] group-hover:brightness-110"
          loading="lazy"
        />
        {/* Play overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-fast group-hover:opacity-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full accent-bg text-black shadow-lg">
            <Play className="h-4 w-4 fill-current" />
          </div>
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 rounded-[3px] bg-black/80 px-1.5 py-0.5 font-mono text-[10px] text-white">
          {formatDuration(video.duration)}
        </div>
        {/* Status pill */}
        <div
          className="absolute top-2 left-2 flex items-center gap-1 rounded-[3px] bg-black/70 px-1.5 py-0.5 backdrop-blur-sm"
          data-testid={`video-status-${video.id}`}
        >
          <span
            className={cx("h-1.5 w-1.5 rounded-full", video.status === "processing" && "dossier-pulse")}
            style={{ backgroundColor: s.color }}
          />
          <span className="font-mono text-[9px] uppercase tracking-widest text-white">
            {s.label}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 border-t border-app px-3 py-2">
        <div className="truncate text-sm font-medium text-app">{video.title}</div>
        <div className="flex items-center justify-between text-[11px] text-muted">
          <span className="font-mono truncate">{video.filename}</span>
          <span className="flex items-center gap-1 flex-shrink-0">
            <Clock className="h-2.5 w-2.5" /> {formatDate(video.modified)}
          </span>
        </div>
      </div>
    </button>
  );
};

export default VideoCard;
