/**
 * The Dossier — brand mark.
 *
 * A stylised "D" that reads as a document card with a fold + play mark,
 * filled with the active accent gradient. Used in the title bar and the
 * home hero.
 */
const DossierMark = ({ size = 24, className = "" }) => {
  const id = `dm-${size}`;
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent-400)" />
          <stop offset="100%" stopColor="var(--accent-600)" />
        </linearGradient>
      </defs>
      {/* Document silhouette */}
      <path
        d="M6 3h13l7 7v19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
        fill={`url(#${id})`}
      />
      {/* Fold */}
      <path d="M19 3v6a2 2 0 0 0 2 2h5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
      {/* Play mark */}
      <path
        d="M12 15.5v6l6-3-6-3z"
        fill="#0B0410"
        opacity="0.92"
      />
    </svg>
  );
};

export default DossierMark;
