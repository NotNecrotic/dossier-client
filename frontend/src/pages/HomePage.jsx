import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, FolderOpen, Send, Sparkles } from "lucide-react";
import DossierMark from "@/components/branding/DossierMark";
import { useStore } from "@/lib/store";
import { aiApi } from "@/lib/api";
import { toast } from "sonner";

const HomePage = () => {
  const navigate = useNavigate();
  const { openVideoAt, settings } = useStore();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const query = q.trim();
    if (!query || busy) return;
    setBusy(true);
    try {
      const res = await aiApi.query(query);
      if (res.hits && res.hits.length) {
        const first = res.hits[0];
        toast.success(res.answer);
        openVideoAt(first.video_id, first.timestamp);
        navigate("/workspace");
      } else {
        toast.info(res.answer || "No matches found in your library.");
      }
    } catch {
      toast.error("Assistant is offline.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-app">
      {/* Ambient purple glows */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(60% 45% at 50% 105%, var(--accent-glow) 0%, transparent 70%), radial-gradient(28% 22% at 82% 78%, var(--accent-glow) 0%, transparent 70%), radial-gradient(20% 16% at 12% 22%, var(--accent-glow) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-72"
        aria-hidden
        style={{
          background:
            "radial-gradient(50% 100% at 50% 100%, var(--accent-500) 0%, transparent 60%)",
          opacity: 0.12,
        }}
      />
      {/* Fine grid */}
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-40" aria-hidden />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center px-6 dossier-fade-in">
        {/* Logo + wordmark */}
        <div className="flex items-center gap-4">
          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-[14px] border border-app bg-surface"
            style={{ boxShadow: "0 0 40px var(--accent-glow), inset 0 0 20px rgba(0,0,0,0.4)" }}
          >
            <DossierMark size={38} />
          </div>
          <h1
            data-testid="home-title"
            className="font-heading text-4xl font-bold tracking-[0.02em] text-app sm:text-5xl"
          >
            THE DOSSIER
          </h1>
        </div>

        <p className="mt-4 text-sm text-2nd sm:text-base">
          Find any moment from any video in seconds.
        </p>

        {/* Search */}
        <div className="mt-8 w-full">
          <div
            className="group flex items-center gap-2 rounded-full border border-app bg-panel/80 py-2 pl-5 pr-2 transition-fast focus-within:border-strong focus-within:shadow-[0_0_0_4px_var(--accent-glow)]"
            style={{
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <Sparkles className="h-4 w-4 flex-shrink-0 accent-text opacity-70" />
            <input
              data-testid="home-search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Describe the scene, conversation, or moment..."
              className="w-full bg-transparent py-2 text-sm text-app placeholder:text-muted outline-none caret-accent sm:text-base"
              disabled={busy}
            />
            <button
              type="button"
              data-testid="home-search-btn"
              onClick={submit}
              disabled={!q.trim() || busy}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full accent-bg text-black transition-fast hover:opacity-90 disabled:opacity-40"
              style={{ boxShadow: "0 0 24px var(--accent-glow)" }}
              title="Search library"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          {settings && !settings.server_url && (
            <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-widest text-muted">
              Connect a processing server in Settings to enable natural-language search
            </p>
          )}
        </div>

        {/* CTA row */}
        <div className="mt-8 flex items-center gap-2">
          <Link
            to="/workspace"
            data-testid="home-explore-btn"
            className="flex items-center gap-2 rounded-full accent-bg px-5 py-2.5 text-sm font-medium text-black transition-fast hover:opacity-90"
            style={{ boxShadow: "0 4px 20px var(--accent-glow)" }}
          >
            <FolderOpen className="h-4 w-4" />
            Explore Workspace
          </Link>
          <Link
            to="/settings"
            data-testid="home-settings-btn"
            title="Settings"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-app bg-surface text-2nd transition-fast hover:border-strong hover:text-app"
          >
            <SettingsIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Bottom soft light bar */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        aria-hidden
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--accent-500) 50%, transparent 100%)",
          opacity: 0.4,
        }}
      />
    </div>
  );
};

export default HomePage;
