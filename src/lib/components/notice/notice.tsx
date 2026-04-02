import { useNotice } from "@/lib/hooks";
import { NoticeVariant } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const variantClasses: Record<NoticeVariant, string> = {
  error:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200",
  success:
    "border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-100",
};
export const Notice = () => {
  const { notice } = useNotice();
  if (!notice) return null;

  const { text, variant = "error", className = "" } = notice;
  
  return (
    <div
      role="status"
      className={cn([
        "rounded-lg border px-3 py-2 text-sm mt-6",
        variantClasses[variant],
        className,
      ])}
    >
      {text}
    </div>
  );
};
