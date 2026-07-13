import { AlertTriangle } from "lucide-react";

const EngineOfflineOverlay = () => (
  <div
    className="fixed inset-x-0 top-11 z-40 flex items-center justify-center gap-2 border-b border-app bg-red-500/10 px-3 py-1.5 text-xs text-red-400"
    data-testid="engine-offline-banner"
  >
    <AlertTriangle className="h-3.5 w-3.5" />
    <span className="font-mono uppercase tracking-widest">
      Dossier engine unreachable — using cached data. Retrying…
    </span>
  </div>
);

export default EngineOfflineOverlay;
