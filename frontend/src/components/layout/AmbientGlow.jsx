/**
 * AmbientGlow — shared soft purple radial glows used across all pages so
 * the visual identity is consistent between Home / Workspace / Settings /
 * Onboarding.
 *
 * Renders a fixed, non-interactive layer that reads the current
 * --accent-glow CSS variable so it adapts when the user picks a different
 * accent colour.
 */
const AmbientGlow = ({ variant = "corners" }) => {
  if (variant === "hero") {
    return (
      <>
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
        <div className="pointer-events-none absolute inset-0 grid-noise opacity-40" aria-hidden />
      </>
    );
  }
  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden
      style={{
        background:
          "radial-gradient(24% 18% at 100% 0%, var(--accent-glow) 0%, transparent 70%), radial-gradient(18% 14% at 0% 100%, var(--accent-glow) 0%, transparent 70%)",
      }}
    />
  );
};

export default AmbientGlow;
