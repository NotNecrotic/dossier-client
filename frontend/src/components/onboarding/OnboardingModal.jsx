import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check, Loader2, Sun, Moon, Sparkles } from "lucide-react";
import { useStore, ACCENTS } from "@/lib/store";
import { serverApi } from "@/lib/api";
import { cx } from "@/lib/format";

const StepShell = ({ index, total, title, subtitle, children, canBack, canNext, nextLabel, onBack, onNext, skippable, onSkip, nextDisabled, nextLoading }) => (
  <div className="flex flex-col" data-testid={`onboarding-step-${index}`}>
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cx(
              "h-1 w-8 rounded-full",
              i < index ? "accent-bg" : i === index ? "accent-bg" : "bg-[color:var(--border-strong)]"
            )}
          />
        ))}
        <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-muted">
          Step {index + 1} / {total}
        </span>
      </div>
      <h2 className="font-heading text-2xl font-bold text-app">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-2nd">{subtitle}</p>}
    </div>
    <div className="mb-8">{children}</div>
    <div className="flex items-center justify-between border-t border-app pt-5">
      <button
        type="button"
        onClick={onBack}
        data-testid="onboarding-back"
        disabled={!canBack}
        className={cx(
          "flex items-center gap-1.5 rounded-[4px] px-3 py-1.5 text-xs transition-fast",
          canBack ? "text-app hover:bg-surface-hover" : "text-muted"
        )}
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
      <div className="flex items-center gap-2">
        {skippable && (
          <button
            type="button"
            onClick={onSkip}
            data-testid="onboarding-skip"
            className="rounded-[4px] px-3 py-1.5 text-xs text-2nd transition-fast hover:text-app"
          >
            Skip
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          data-testid="onboarding-next"
          disabled={!canNext || nextDisabled}
          className={cx(
            "flex items-center gap-1.5 rounded-[4px] px-4 py-1.5 text-xs font-medium transition-fast",
            canNext && !nextDisabled
              ? "accent-bg text-black hover:opacity-90"
              : "bg-surface text-muted border border-app"
          )}
        >
          {nextLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              {nextLabel || "Continue"} <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

const OnboardingModal = () => {
  const { settings, updateSettings } = useStore();
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState(settings?.theme || "dark");
  const [accent, setAccent] = useState(settings?.accent || "Sapphire");
  const [serverUrl, setServerUrl] = useState(settings?.server_url || "");
  const [serverKey, setServerKey] = useState(settings?.server_key || "");
  const [videoRoot, setVideoRoot] = useState(settings?.video_root || "");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const applyTheme = async (t, a) => {
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

  // Validation
  const canNext0 = true;
  const canNext1 = serverUrl.trim().length > 5;
  const canNext2 = videoRoot.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl"
      data-testid="onboarding-overlay"
    >
      <div className="dossier-modal w-[560px] max-w-[92vw] rounded-[8px] border border-app bg-panel shadow-2xl">
        <div className="flex items-center gap-2 border-b border-app px-5 py-3">
          <Sparkles className="h-4 w-4 accent-text" />
          <span className="font-heading text-sm font-semibold text-app">Welcome to Dossier</span>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted">
            Initial setup
          </span>
        </div>
        <div className="p-6">
          {step === 0 && (
            <StepShell
              index={0}
              total={3}
              title="Make it yours"
              subtitle="Pick a theme and accent. You can change these any time in Settings."
              canBack={false}
              canNext={canNext0}
              onBack={() => {}}
              onNext={() => setStep(1)}
              skippable
              onSkip={() => setStep(1)}
            >
              <div className="space-y-5">
                <div>
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                    Theme
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      data-testid="onboarding-theme-dark"
                      onClick={() => applyTheme("dark", accent)}
                      className={cx(
                        "flex items-center gap-2 rounded-[6px] border p-3 text-sm transition-fast",
                        theme === "dark"
                          ? "border-strong bg-surface text-app accent-border"
                          : "border-app bg-surface text-2nd hover:text-app"
                      )}
                    >
                      <Moon className="h-4 w-4" /> Dark
                    </button>
                    <button
                      type="button"
                      data-testid="onboarding-theme-light"
                      onClick={() => applyTheme("light", accent)}
                      className={cx(
                        "flex items-center gap-2 rounded-[6px] border p-3 text-sm transition-fast",
                        theme === "light"
                          ? "border-strong bg-surface text-app accent-border"
                          : "border-app bg-surface text-2nd hover:text-app"
                      )}
                    >
                      <Sun className="h-4 w-4" /> Light
                    </button>
                  </div>
                </div>
                <div>
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                    Accent
                  </div>
                  <div className="flex gap-2">
                    {Object.values(ACCENTS).map((a) => {
                      const active = accent === a.name;
                      return (
                        <button
                          key={a.name}
                          type="button"
                          onClick={() => applyTheme(theme, a.name)}
                          data-testid={`onboarding-accent-${a.name.toLowerCase()}`}
                          title={a.name}
                          className={cx(
                            "relative flex h-8 w-8 items-center justify-center rounded-full border transition-fast",
                            active ? "border-strong scale-110" : "border-app hover:scale-110"
                          )}
                          style={{ backgroundColor: a.main }}
                        >
                          {active && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </StepShell>
          )}
          {step === 1 && (
            <StepShell
              index={1}
              total={3}
              title="Connect your processing server"
              subtitle="Dossier delegates AI to your own server. Required."
              canBack
              canNext={canNext1}
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
            >
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
                    Server URL
                  </label>
                  <input
                    data-testid="onboarding-server-url"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="https://ollama.local:11434"
                    className="w-full rounded-[4px] border border-app bg-surface px-3 py-2 font-mono text-sm text-app placeholder:text-muted outline-none focus:border-strong focus:accent-border caret-accent"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
                    Server key (optional)
                  </label>
                  <input
                    data-testid="onboarding-server-key"
                    type="password"
                    value={serverKey}
                    onChange={(e) => setServerKey(e.target.value)}
                    placeholder="sk-•••"
                    className="w-full rounded-[4px] border border-app bg-surface px-3 py-2 font-mono text-sm text-app placeholder:text-muted outline-none focus:border-strong focus:accent-border caret-accent"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[10px] text-muted">
                    Credentials never leave your machine.
                  </span>
                  <button
                    type="button"
                    onClick={testServer}
                    data-testid="onboarding-test-server"
                    disabled={testing || !serverUrl.trim()}
                    className={cx(
                      "flex items-center gap-1.5 rounded-[4px] border border-app px-2.5 py-1 text-xs transition-fast",
                      testing || !serverUrl.trim() ? "text-muted" : "text-app hover:bg-surface-hover"
                    )}
                  >
                    {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : "Test"}
                  </button>
                </div>
                {testResult && (
                  <div
                    className={cx(
                      "rounded-[4px] border px-3 py-2 font-mono text-[11px]",
                      testResult.ok
                        ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/5"
                        : "border-red-500/40 text-red-400 bg-red-500/5"
                    )}
                  >
                    {testResult.ok
                      ? `Reachable · ${testResult.latency_ms}ms`
                      : testResult.message || "Unreachable"}
                  </div>
                )}
              </div>
            </StepShell>
          )}
          {step === 2 && (
            <StepShell
              index={2}
              total={3}
              title="Point Dossier at your videos"
              subtitle="Choose the root folder — everything below it is indexed. Required."
              canBack
              canNext={canNext2}
              nextLabel="Finish setup"
              nextLoading={saving}
              onBack={() => setStep(1)}
              onNext={finish}
            >
              <div>
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
                  Video root folder
                </label>
                <input
                  data-testid="onboarding-video-root"
                  value={videoRoot}
                  onChange={(e) => setVideoRoot(e.target.value)}
                  placeholder="/Users/you/Videos"
                  className="w-full rounded-[4px] border border-app bg-surface px-3 py-2 font-mono text-sm text-app placeholder:text-muted outline-none focus:border-strong focus:accent-border caret-accent"
                />
                <p className="mt-2 text-xs text-2nd">
                  Dossier will recursively scan this folder. Large libraries are supported —
                  processing runs in the background.
                </p>
              </div>
            </StepShell>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
