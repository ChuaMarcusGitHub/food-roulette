export const SpinProgressRing = ({ progress }: { progress: number }) => {
  const r = 42;
  const c = 2 * Math.PI * r;
  const dash = c * Math.max(0, Math.min(1, progress));
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full -rotate-90 motion-safe:transition-[stroke-dasharray] motion-reduce:transition-none"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        className="stroke-slate-200 dark:stroke-slate-600"
        strokeWidth="2.5"
      />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="#0d9488"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        className="motion-safe:duration-75 motion-reduce:duration-0"
      />
    </svg>
  );
};
