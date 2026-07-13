import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Sun,
  Moon,
  Sparkles,
  Server,
  FolderTree,
  KeyRound,
} from "lucide-react";
import { useStore, ACCENTS } from "@/lib/store";
import { serverApi } from "@/lib/api";
import { cx } from "@/lib/format";
import AmbientGlow from "@/components/layout/AmbientGlow";
import DossierMark from "@/components/branding/DossierMark";

/* ---------- shared primitives ------------------------------------------- */

const Pill = ({ value, onChange, placeholder, testid, type = "text", mono = true, icon: Icon }) => (
  <div className="flex items-center gap-2 rounded-full border border-app bg-panel/70 px-4 py-2.5 backdrop-blur-xl transition-fast focus-within:border-strong focus-within:shadow-[0_0_0_4px_var(--accent-glow)]">
    {Icon && <Icon className="h-4 w-4 flex-shrink-0 text-muted" />}
    <input
      data-testid={testid}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cx(
        "w-full bg-transparent text-sm text-app outline-none placeholder:text-muted caret-accent",
        mono && "font-mono"
      )}
    />
  </div>
);

/* ---------- step 1: theme + accent -------------------------------------- */

const ThemeStep = ({ theme, setTheme, accent, setAccent }) => (
  <div className="space-y-8">
    <div>
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
        Theme
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: "dark", label: "Dark", Icon: Moon },
          { key: "light", label: "Light", Icon: Sun },
        ].map(({ key, label, Icon }) => {
          const active = theme === key;
          return (
            <button
              key={key}
              type="button"
              data-testid={`onboarding-theme-${key}`}
              onClick={() => setTheme(key)}
              className={cx(
                "flex items-center justify-center gap-2.5 rounded-2xl border p-4 text-sm transition-fast",
                active
                  ? "border-transparent text-app"
                  : "border-app bg-panel/60 text-2nd hover:text-app"
              )}
              style={
                active
                  ? {
                      background:
                        "linear-gradient(180deg, var(--accent-glow) 0%, transparent 100%), var(--panel)",
                      boxShadow: "0 0 0 1px var(--accent-500), 0 0 24px var(--accent-glow)",
                    }
                  : undefined
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          );
        })}
      </div>
    </div>
    <div>
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
        Accent colour
      </div>
      <div className="flex items-center gap-3">
        {Object.values(ACCENTS).map((a) => {
          const active = accent === a.name;
          return (
            <button
              key={a.name}
              type="button"
              data-testid={`onboarding-accent-${a.name.toLowerCase()}`}
              onClick={() => setAccent(a.name)}
              title={a.name}
              className={cx(
                "relative flex h-10 w-10 items-center justify-center rounded-full border transition-fast",
                active ? "border-white/70 scale-110" : "border-app hover:scale-110"
              )}
              style={{
                backgroundColor: a.main,
                boxShadow: active ? `0 0 20px ${a.glow}` : undefined,
              }}
            >
              {active && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

/* ---------- step 2: server ---------------------------------------------- */

const ServerStep = ({ url, setUrl, key, setKey, testing, testResult, onTest }) => (
  <div className="space-y-4">
    <div>
      <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
        Server URL <span className="text-red-400">(required)</span>
      </label>
      <Pill
        testid="onboarding-server-url"
        value={url}
        onChange={setUrl}
        placeholder="https://ollama.local:11434"
        icon={Server}
      />
    </div>
    <div>
      <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
        Server key (optional)
      </label>
      <Pill
        testid="onboarding-server-key"
        value={key}
        onChange={setKey}
        placeholder="sk-•••"
        type="password"
        icon={KeyRound}
      />
    </div>
    <div className="flex items-center justify-between pt-1">
      <span className="font-mono text-[10px] text-muted">
        Credentials never leave your machine.
      </span>
      <button
        type="button"
        onClick={onTest}
        data-testid="onboarding-test-server"
        disabled={testing || !url.trim()}
        className={cx(
          "flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs transition-fast",
          testing || !url.trim()
            ? "border-app text-muted"
            : "border-app text-app hover:border-strong hover:bg-surface-hover"
        )}
      >
        {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : "Test connection"}
      </button>
    </div>
    {testResult && (
      <div
        className={cx(
          "rounded-full border px-4 py-2 font-mono text-[11px]",
          testResult.ok
            ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400"
            : "border-red-500/40 bg-red-500/5 text-red-400"
        )}
      >
        {testResult.ok
          ? `Reachable · ${testResult.latency_ms}ms`
          : testResult.message || "Unreachable"}
      </div>
    )}
  </div>
);

/* ---------- step 3: video root ----------------------------------------- */

const RootStep = ({ root, setRoot }) => (
  <div className="space-y-3">
    <label className="block font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
      Video root folder <span className="text-red-400">(required)</span>
    </label>
    <Pill
      testid="onboarding-video-root"
      value={root}
      onChange={setRoot}
      placeholder="/Users/you/Videos"
      icon={FolderTree}
    />
    <p className="text-xs text-2nd">
      Dossier will recursively scan this folder. Large libraries are supported — processing runs in the background.
    </p>
  </div>
);

/* ---------- main component --------------------------------------------- */

const OnboardingModal = () => {
  const { settings, updateSettings } = useStore();
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState(settings?.theme || "dark");
  const [accent, setAccent] = useState(settings?.accent || "Amethyst");
  const [serverUrl, setServerUrl] = useState(settings?.server_url || "");
  const [serverKey, setServerKey] = useState(settings?.server_key || "");
  const [videoRoot, setVideoRoot] = useState(settings?.video_root || "");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);

  // Apply theme + accent live so the page reflects the choice immediately.
  const applyThemeLive = async (t, a) => {
    setTheme(t);
    setAccent(a);
    await updateSettings({ theme: t, accent: a });
  };

  const testServer = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const r = await serverApi.test({ url: serverUrl, key: serverKey });
      setTestResult(r);
      if (r.ok) toast.success(`Reachable · ${r.latency_ms}ms`);
      else toast.error(r.message || "Unreachable");
    } catch {
      setTestResult({ ok: false, message: "Test failed" });
      toast.error("Test failed");
    } finally {
      setTesting(false);
    }
  };

  const finish = async () => {
    setSaving(true);
    try {
      await updateSettings({
        theme,
        accent,
        server_url: serverUrl,
        server_key: serverKey,
        video_root: videoRoot,
        onboarding_complete: true,
      });
      toast.success("Dossier is ready");
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    {
      title: "Make it yours",
      subtitle: "Pick a theme and accent. You can change these any time in Settings.",
      skippable: true,
      canNext: true,
      body: (
        <ThemeStep
          theme={theme}
          setTheme={(t) => applyThemeLive(t, accent)}
          accent={accent}
          setAccent={(a) => applyThemeLive(theme, a)}
        />
      ),
    },
    {
      title: "Connect your processing server",
      subtitle: "Dossier delegates AI to your own server. Required.",
      skippable: false,
      canNext: serverUrl.trim().length > 5,
      body: (
        <ServerStep
          url={serverUrl}
          setUrl={setServerUrl}
          key={serverKey}
          setKey={setServerKey}
          testing={testing}
          testResult={testResult}
          onTest={testServer}
        />
      ),
    },
    {
      title: "Point Dossier at your videos",
      subtitle: "Choose the root folder — everything below it is indexed. Required.",
      skippable: false,
      canNext: videoRoot.trim().length > 0,
      nextLabel: "Finish setup",
      body: <RootStep root={videoRoot} setRoot={setVideoRoot} />,
    },
  ];

  const current = steps[step];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-app"
      data-testid="onboarding-overlay"
    >
      <AmbientGlow variant="hero" />

      {/* Slim brand header */}
      <div className="relative z-10 flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <DossierMark size={22} />
          <span className="font-heading text-sm font-bold tracking-[0.24em] text-app">
            THE DOSSIER
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
          Initial setup
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6">
        <div className="dossier-fade-in w-full max-w-xl">
          {/* Step dots */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {steps.map((_, i) => (
              <span
                key={i}
                className={cx(
                  "h-1.5 rounded-full transition-fast",
                  i === step
                    ? "w-10 accent-bg"
                    : i < step
                    ? "w-6 accent-bg opacity-60"
                    : "w-6 bg-[color:var(--border-strong)]"
                )}
                style={i === step ? { boxShadow: "0 0 12px var(--accent-500)" } : undefined}
              />
            ))}
          </div>

          <div className="text-center">
            <div className="mb-2 flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
              <Sparkles className="h-3 w-3 accent-text" />
              Step {step + 1} of {steps.length}
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-app sm:text-4xl">
              {current.title}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-2nd">{current.subtitle}</p>
          </div>

          <div className="mt-10 rounded-3xl border border-app bg-panel/50 p-8 backdrop-blur-2xl"
               style={{ boxShadow: "0 20px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset" }}>
            {current.body}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              data-testid="onboarding-back"
              disabled={step === 0}
              className={cx(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs transition-fast",
                step === 0 ? "text-muted" : "text-2nd hover:text-app hover:bg-surface-hover"
              )}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <div className="flex items-center gap-2">
              {current.skippable && (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                  data-testid="onboarding-skip"
                  className="rounded-full px-4 py-2 text-xs text-2nd transition-fast hover:text-app"
                >
                  Skip
                </button>
              )}
              <button
                type="button"
                onClick={() => (step === steps.length - 1 ? finish() : setStep(step + 1))}
                data-testid="onboarding-next"
                disabled={!current.canNext || saving}
                className={cx(
                  "flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-medium transition-fast",
                  current.canNext && !saving
                    ? "accent-bg text-black hover:opacity-90"
                    : "bg-surface text-muted border border-app"
                )}
                style={
                  current.canNext && !saving
                    ? { boxShadow: "0 4px 24px var(--accent-glow)" }
                    : undefined
                }
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    {current.nextLabel || "Continue"} <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
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

export default OnboardingModal;
