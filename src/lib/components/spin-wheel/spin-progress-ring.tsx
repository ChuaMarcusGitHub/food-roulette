import { cn } from "@/lib/utils/cn";

const styles = {
  svg: {
    base: "pointer-events-none absolute inset-0 h-full w-full",
    motion:
      "-rotate-90 motion-safe:transition-[stroke-dasharray] motion-reduce:transition-none",
  },
  circle: {
    outer: "stroke-slate-200 dark:stroke-slate-600",
    inner:
      "stroke-teal-600 [stroke-linecap:round] motion-safe:duration-75 motion-reduce:duration-0",
  },
};
export const SpinProgressRing = ({ progress }: { progress: number }) => {
  const { svg, circle } = styles;
  const r = 42;
  const c = 2 * Math.PI * r;
  const dash = c * Math.max(0, Math.min(1, progress));
  return (
    <svg className={cn(svg.base, svg.motion)} viewBox="0 0 100 100" aria-hidden>
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        strokeWidth="2.5"
        strokeDasharray={`${dash} ${c}`}
        className={circle.outer}
      />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        strokeWidth="2.5"
        strokeDasharray={`${dash} ${c}`}
        className={circle.inner}
      />
    </svg>
  );
};
