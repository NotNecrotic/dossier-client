import { Link, useLocation } from "react-router-dom";
import { Settings as SettingsIcon, FolderOpen, Cpu, Zap, Circle } from "lucide-react";
import { useStore } from "@/lib/store";
import { cx } from "@/lib/format";

const DossierMark = () => (
  <div className="flex h-6 w-6 items-center justify-center rounded-[4px] border border-app bg-surface">
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 4v16M5 4h9l4 4v12H5" strokeLinejoin="round" />
      <path d="M14 4v4h4" />
      <circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  </div>
);

const TitleBar = () => {
  const { settings, engineStatus } = useStore();
  const location = useLocation();
  const onSettings = location.pathname.startsWith("/settings");

  return (
    <div
      className="flex h-11 items-center justify-between border-b border-app bg-panel px-3 select-none"
      data-testid="app-titlebar"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 accent-text">
          <DossierMark />
          <span className="font-heading text-sm font-bold tracking-wide text-app">Dossier</span>
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-widest text-muted">
            v1.0
          </span>
        </div>
        <div className="mx-2 h-4 w-px bg-app" />
        <nav className="flex items-center gap-1">
          <Link
            to="/"
            data-testid="nav-workspace"
            className={cx(
              "flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-xs transition-fast",
              !onSettings
                ? "bg-surface text-app border border-app"
                : "text-2nd hover:text-app hover:bg-surface-hover border border-transparent"
            )}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Workspace
          </Link>
          <Link
            to="/settings"
            data-testid="nav-settings"
            className={cx(
              "flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-xs transition-fast",
              onSettings
                ? "bg-surface text-app border border-app"
                : "text-2nd hover:text-app hover:bg-surface-hover border border-transparent"
            )}
          >
            <SettingsIcon className="h-3.5 w-3.5" />
            Settings
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3 font-mono text-[11px] text-2nd">
        <div className="flex items-center gap-1.5" data-testid="engine-status">
          <Circle
            className={cx(
              "h-2 w-2 fill-current",
              engineStatus === "online" ? "text-emerald-500" : "text-red-500"
            )}
            strokeWidth={0}
          />
          <span className="uppercase tracking-widest">
            {engineStatus === "online" ? "Engine" : "Offline"}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1.5" data-testid="server-status">
          <Zap className="h-3 w-3 text-muted" />
          <span className="max-w-[180px] truncate">
            {(() => {
              const url = settings?.server_url;
              if (!url) return "no server";
              try {
                return new URL(url).host || url;
              } catch {
                return url;
              }
            })()}
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 text-muted">
          <Cpu className="h-3 w-3" />
          <span>{settings?.cpu_limit ?? 60}%</span>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
