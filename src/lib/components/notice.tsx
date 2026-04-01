import type { INoticeType } from "../types";

interface NoticeProps {
  notice: INoticeType | null;
  className?: string;
}

/** Dismissible notice banner (error or success). */
export const Notice = ({ notice, className = "" }: NoticeProps) => {
  if (!notice) return null;
  return (
    <div
      role="status"
      className={`rounded-lg border px-3 py-2 text-sm ${
        notice.isError
          ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
          : "border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-100"
      } ${className}`}
    >
      {notice.text}
    </div>
  );
};
