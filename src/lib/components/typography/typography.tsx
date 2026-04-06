import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { HTMLAttributes } from "react";

const textVariants = cva("", {
  variants: {
    variant: {
      h1: "text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50",
      body1: "text-sm text-slate-600 dark:text-slate-400",
      body2: "text-sm font-semibold text-slate-900 dark:text-slate-100",
      muted: "text-sm text-slate-500 dark:text-slate-400",
      mutedXs: "text-xs text-slate-500 dark:text-slate-400",
      label:
        "text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400",
      labelXs:
        "text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400",
      hint: "rounded-lg bg-slate-50 px-2 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      warn: "rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100",
    },
  },
  defaultVariants: {
    variant: "body1",
  },
});

interface ITextProps
  extends
    HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {}
/**
 * PText is used because Text is already taken
 */
export const PText = ({ variant, className, ...props }: ITextProps) => (
  <p className={cn(textVariants({ variant }), className)} {...props} />
);
