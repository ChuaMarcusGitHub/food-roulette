import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

const cardVariants = cva(
  "rounded-xl border",
  {
    variants: {
      intent: {
        default:  "border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900",
        muted:    "border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/40",
        sunken:   "bg-slate-50 dark:bg-slate-800/30",
        overlay:  "border-slate-200 bg-white/60 dark:border-slate-600 dark:bg-slate-900/30",
        warning:  "border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30",
        danger:   "border-red-200 bg-red-50/60 dark:border-red-900/60 dark:bg-red-950/30",
        dashed:   "border-dashed border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/30",
      },
      padding: {
        none: "",
        sm:   "p-3",
        md:   "p-5",
        lg:   "p-6",
      },
    },
    defaultVariants: {
      intent:  "default",
      padding: "md",
    },
  },
);

interface ICardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = ({ intent, padding, className, ...props }: ICardProps) => (
  <div className={cn(cardVariants({ intent, padding }), className)} {...props} />
);
