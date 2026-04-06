import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      intent: {
        primary:
          "bg-teal-600 text-white shadow-sm hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900",
        ghost:
          "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
        danger:
          "bg-red-700 text-white hover:bg-red-800 focus-visible:ring-2 focus-visible:ring-red-500",
        dangerGhost:
          "border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-950",
        warning: "bg-amber-500 text-amber-950 hover:bg-amber-400",
        warningGhost:
          "border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100",
        submit:
          "bg-slate-900 text-white hover:bg-slate-800 dark:bg-teal-800 dark:hover:bg-teal-700",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2.5 text-sm",
        full: "w-full px-4 py-2.5 text-sm",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  },
);

interface IButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = ({ intent, size, className, ...props }: IButtonProps) => (
  <button
    type="button"
    className={cn(buttonVariants({ intent, size }), className)}
    {...props}
  />
);
