import { FolderTree, Zap, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Step = ({ icon: Icon, title, description, action }) => (
  <div className="flex items-start gap-4 rounded-[6px] border border-app bg-surface p-5 transition-fast hover:border-strong">
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[6px] accent-bg-soft accent-text">
      <Icon className="h-4 w-4" />
    </div>
    <div className="flex-1">
      <h3 className="font-heading text-sm font-semibold text-app">{title}</h3>
      <p className="mt-1 text-xs text-2nd">{description}</p>
      {action}
    </div>
  </div>
);

const EmptyState = ({ mode = "empty", folderName }) => {
  if (mode === "setup") {
    return (
      <div className="flex h-full items-center justify-center p-8" data-testid="empty-state-setup">
        <div className="w-full max-w-xl">
          <div className="mb-6">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted">
              Getting started
            </div>
            <h2 className="font-heading text-3xl font-bold text-app">
              Set up your Dossier
            </h2>
            <p className="mt-2 text-sm text-2nd">
              A few quick steps and your video archive becomes searchable by natural language.
            </p>
          </div>
          <div className="space-y-3">
            <Step
              icon={FolderTree}
              title="Point Dossier at your video root"
              description="Choose the top-level folder that contains all of your videos. Dossier will index it recursively."
              action={
                <Link
                  to="/settings"
                  data-testid="setup-storage-link"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-[4px] border border-app px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-app hover:bg-surface-hover"
                >
                  Configure storage
                </Link>
              }
            />
            <Step
              icon={Zap}
              title="Connect to your processing server"
              description="Dossier delegates transcription and embeddings to a remote server you control (e.g. Ollama)."
              action={
                <Link
                  to="/settings"
                  data-testid="setup-server-link"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-[4px] border border-app px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-app hover:bg-surface-hover"
                >
                  Connect server
                </Link>
              }
            />
            <Step
              icon={Sparkles}
              title="Start indexing"
              description="Once configured, videos will begin appearing in the Explorer with live processing status."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-3 text-center p-6"
      data-testid="empty-state-empty"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-[6px] border border-app bg-surface text-muted">
        <Play className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-heading text-base font-semibold text-app">
          Nothing in {folderName || "this folder"} yet
        </h3>
        <p className="mt-1 text-xs text-2nd">
          Add videos to this location on disk and they will appear here.
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
