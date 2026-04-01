import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"
import type { InputHTMLAttributes } from "react"

const base = [
  "w-full rounded-lg border bg-white outline-none",
  "px-3 py-2.5 text-sm text-slate-900",
  "placeholder:text-slate-400",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500",
].join(" ")

const inputVariants = cva(base, {
  variants: {
    intent: {
      default: "border-slate-200 focus:ring-2 focus:ring-teal-600 dark:border-slate-600",
      error:   "border-red-400 focus:ring-2 focus:ring-red-500 dark:border-red-600",
    },
  },
  defaultVariants: {
    intent: "default",
  },
})

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

export const Input = ({ intent, className, ...props }: InputProps) => (
  <input className={cn(inputVariants({ intent }), className)} {...props} />
)
