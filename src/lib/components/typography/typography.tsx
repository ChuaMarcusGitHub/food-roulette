import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { HTMLAttributes } from "react";

const textVariants = cva("", {
  variants: {
    variant: {
      h1: "text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50",
      body1: "text-sm text-slate-600 dark:text-slate-400",
      body2: "text-sm font-semibold text-slate-900 dark:text-slate-100",
      muted: "text-xs text-slate-500 dark:text-slate-400",
      label:
        "text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400",
      labelSm:
        "text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400",
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

export const Text = ({ variant, className, ...props }: ITextProps) => (
  <p className={cn(textVariants({ variant }), className)} {...props} />
);
