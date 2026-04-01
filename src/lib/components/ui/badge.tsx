import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      intent: {
        default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        primary: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-100",
        warning: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
        danger:  "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
      },
    },
    defaultVariants: {
      intent: "default",
    },
  },
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ intent, className, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ intent }), className)} {...props} />
);
