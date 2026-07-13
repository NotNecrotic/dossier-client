import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useStore, ACCENTS } from "@/lib/store";
import { serverApi } from "@/lib/api";
import { cx } from "@/lib/format";
import {
  Server,
  HardDrive,
  Cpu,
  Palette,
  Check,
  Loader2,
  KeyRound,
  Sun,
  Moon,
  Zap,
  MonitorCog,
} from "lucide-react";

/* ---------- primitives ---------------------------------------------------- */

const Section = ({ icon: Icon, title, description, children }) => (
  <section
    className="relative overflow-hidden rounded-2xl border border-app bg-panel/60 p-6 backdrop-blur-xl"
    style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset" }}
    data-testid={`section-${title.toLowerCase()}`}
  >
    {/* soft glow in the top-right of each card */}
    <div
      className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full"
      aria-hidden
      style={{
        background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
      }}
    />
    <div className="relative mb-5 flex items-start gap-3">
      <div
        className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full accent-bg-soft accent-text"
        style={{ boxShadow: "0 0 24px var(--accent-glow)" }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h2 className="font-heading text-lg font-semibold text-app">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-2nd">{description}</p>}
      </div>
    </div>
    <div className="relative space-y-1">{children}</div>
  </section>
);

const Row = ({ title, description, children }) => (
  <div className="flex items-center justify-between gap-6 border-b border-app/60 py-4 last:border-b-0">
    <div className="flex-1 min-w-0">
      <div className="text-sm text-app">{title}</div>
      {description && <div className="mt-0.5 text-xs text-2nd">{description}</div>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const PillInput = ({ value, onCommit, placeholder, testid, type = "text", mono = false, icon: Icon }) => {
  const [draft, setDraft] = useState(value ?? "");
  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);
  return (
    <div className="flex w-80 items-center gap-2 rounded-full border border-app bg-surface px-4 py-2 transition-fast focus-within:border-strong focus-within:shadow-[0_0_0_4px_var(--accent-glow)]">
      {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0 text-muted" />}
      <input
        data-testid={testid}
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== (value ?? "")) onCommit(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        placeholder={placeholder}
        className={cx(
          "w-full bg-transparent text-sm text-app outline-none placeholder:text-muted caret-accent",
          mono && "font-mono"
        )}
      />
    </div>
  );
};

const Slider = ({ value, onChange, min, max, step = 1, unit = "", testid }) => (
  <div className="flex items-center gap-3">
    <input
      type="range"
      data-testid={testid}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="dossier-range w-56"
    />
    <span
      className="w-20 rounded-full border border-app bg-surface px-3 py-0.5 text-center font-mono text-xs text-app"
      style={{ boxShadow: "0 0 12px var(--accent-glow)" }}
    >
      {value}
      {unit}
    </span>
  </div>
);

const Toggle = ({ value, onChange, testid }) => (
  <button
    type="button"
    role="switch"
    aria-checked={value}
    data-testid={testid}
    onClick={() => onChange(!value)}
    className={cx(
      "relative h-6 w-11 rounded-full border transition-fast",
      value ? "accent-bg accent-border" : "bg-surface border-app"
    )}
    style={value ? { boxShadow: "0 0 16px var(--accent-glow)" } : undefined}
  >
    <span
      className={cx(
        "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
        value ? "translate-x-6" : "translate-x-0.5"
      )}
    />
  </button>
);

/* ---------- view ---------------------------------------------------------- */

const SettingsView = () => {
  const { settings, updateSettings } = useStore();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!settings) {
    return <div className="p-8 text-2nd">Loading settings…</div>;
  }

  const set = (patch) => updateSettings(patch);

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await serverApi.test({ url: settings.server_url, key: settings.server_key });
      setTestResult(res);
      if (res.ok) toast.success(`Server reachable · ${res.latency_ms}ms`);
      else toast.error(res.message || "Server unreachable");
    } catch {
      toast.error("Test failed");
      setTestResult({ ok: false, message: "Test failed" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-8 py-12" data-testid="settings-view">
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full accent-bg" style={{ boxShadow: "0 0 8px var(--accent-500)" }} />
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
            Preferences
          </span>
        </div>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-app">Settings</h1>
        <p className="mt-2 text-sm text-2nd">
          Configure how Dossier connects to your processing server and indexes your library.
        </p>
      </div>

      <div className="space-y-6">
        <Section
          icon={Server}
          title="Connection"
          description="Where Dossier delegates transcription, embeddings, and AI queries."
        >
          <Row title="Processing server URL" description="Press Enter or click away to save.">
            <PillInput
              testid="settings-server-url"
              value={settings.server_url}
              onCommit={(v) => set({ server_url: v })}
              placeholder="https://ollama.local:11434"
              mono
            />
          </Row>
          <Row title="Server key" description="Access key stored on the local engine only.">
            <PillInput
              testid="settings-server-key"
              value={settings.server_key}
              onCommit={(v) => set({ server_key: v })}
              placeholder="sk-•••"
              type="password"
              mono
              icon={KeyRound}
            />
          </Row>
          <Row title="Connection test" description="Verify Dossier can reach your server.">
            <div className="flex items-center gap-3">
              {testResult && (
                <span
                  className={cx(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px]",
                    testResult.ok
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-red-500/40 bg-red-500/10 text-red-400"
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {testResult.ok ? `OK · ${testResult.latency_ms}ms` : "Failed"}
                </span>
              )}
              <button
                type="button"
                data-testid="settings-test-server"
                onClick={runTest}
                disabled={testing || !settings.server_url}
                className={cx(
                  "flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs transition-fast",
                  testing || !settings.server_url
                    ? "border-app text-muted"
                    : "border-app text-app hover:border-strong hover:bg-surface-hover"
                )}
              >
                {testing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="h-3.5 w-3.5 accent-text" />
                )}
                Test connection
              </button>
            </div>
          </Row>
        </Section>

        <Section icon={HardDrive} title="Storage" description="Where your videos live on disk.">
          <Row title="Video root folder" description="Top-level folder to scan recursively.">
            <PillInput
              testid="settings-video-root"
              value={settings.video_root}
              onCommit={(v) => set({ video_root: v })}
              placeholder="/Users/you/Videos"
              mono
            />
          </Row>
        </Section>

        <Section icon={Cpu} title="Processing" description="Limits applied while indexing runs locally.">
          <Row title="CPU usage limit" description="Cap engine CPU during processing.">
            <Slider
              testid="settings-cpu-limit"
              value={settings.cpu_limit}
              onChange={(v) => set({ cpu_limit: v })}
              min={10}
              max={100}
              step={5}
              unit="%"
            />
          </Row>
          <Row title="Upload bandwidth" description="Maximum outbound throughput.">
            <Slider
              testid="settings-upload-limit"
              value={settings.upload_limit_mbps}
              onChange={(v) => set({ upload_limit_mbps: v })}
              min={1}
              max={200}
              step={1}
              unit=" Mbps"
            />
          </Row>
          <Row title="Frame sampling rate" description="Frames per second sampled for embeddings.">
            <Slider
              testid="settings-frame-sampling"
              value={settings.frame_sampling}
              onChange={(v) => set({ frame_sampling: v })}
              min={1}
              max={30}
              unit=" fps"
            />
          </Row>
        </Section>

        <Section icon={Palette} title="Appearance" description="Theme and accent colour. Applies instantly.">
          <Row title="Theme" description="Dark by default. Choose whichever is easier on your eyes.">
            <div className="flex items-center gap-1.5 rounded-full border border-app bg-surface p-1">
              <button
                type="button"
                data-testid="settings-theme-dark"
                onClick={() => set({ theme: "dark" })}
                className={cx(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-fast",
                  settings.theme === "dark"
                    ? "bg-surface-hover text-app"
                    : "text-2nd hover:text-app"
                )}
                style={settings.theme === "dark" ? { boxShadow: "0 0 12px var(--accent-glow)" } : undefined}
              >
                <Moon className="h-3.5 w-3.5" /> Dark
              </button>
              <button
                type="button"
                data-testid="settings-theme-light"
                onClick={() => set({ theme: "light" })}
                className={cx(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-fast",
                  settings.theme === "light"
                    ? "bg-surface-hover text-app"
                    : "text-2nd hover:text-app"
                )}
                style={settings.theme === "light" ? { boxShadow: "0 0 12px var(--accent-glow)" } : undefined}
              >
                <Sun className="h-3.5 w-3.5" /> Light
              </button>
            </div>
          </Row>
          <Row title="Accent colour" description="Used for primary actions and AI jump markers.">
            <div className="flex items-center gap-2">
              {Object.values(ACCENTS).map((a) => {
                const active = settings.accent === a.name;
                return (
                  <button
                    key={a.name}
                    type="button"
                    data-testid={`settings-accent-${a.name.toLowerCase()}`}
                    onClick={() => set({ accent: a.name })}
                    title={a.name}
                    className={cx(
                      "relative flex h-7 w-7 items-center justify-center rounded-full border transition-fast",
                      active ? "border-white/70 scale-110" : "border-app hover:scale-110"
                    )}
                    style={{
                      backgroundColor: a.main,
                      boxShadow: active ? `0 0 16px ${a.glow}` : undefined,
                    }}
                  >
                    {active && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </Row>
        </Section>

        <Section
          icon={MonitorCog}
          title="Application"
          description="Startup behaviour and background operation."
        >
          <Row title="Start on system boot" description="Launch the Dossier engine automatically.">
            <Toggle
              testid="settings-start-on-boot"
              value={settings.start_on_boot}
              onChange={(v) => set({ start_on_boot: v })}
            />
          </Row>
          <Row title="Run in system tray" description="Keep the engine indexing after the UI is closed.">
            <Toggle
              testid="settings-tray-mode"
              value={settings.tray_mode}
              onChange={(v) => set({ tray_mode: v })}
            />
          </Row>
        </Section>
      </div>
    </div>
  );
};

export default SettingsView;
