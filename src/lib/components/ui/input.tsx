import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = ({ className, ...props }: InputProps) => (
  <input
    className={cn(
      "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900",
      "placeholder:text-slate-400 outline-none ring-teal-600 focus:ring-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500",
      className,
    )}
    {...props}
  />
);
