import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { HTMLAttributes } from "react";

const textVariants = cva("", {
  variants: {
    variant: {
      h1: "text-4xl font bold tracking-tight",
      h2: "text-2xl font-semibold tracking-tight",
      h3: "text-xl font-semibold",
      title: "text-lg font-semibold",
      body: "text-sm",
      muted: "text-xs text-slade-500 darkLtest slade-400",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

interface ITextProps
  extends
    HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {}
export const Text = ({ variant, className, ...props }: ITextProps) => (
  <p className={cn(textVariants({ variant }), className)} {...props} />
);
