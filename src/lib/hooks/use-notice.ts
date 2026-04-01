import { useCallback, useEffect, useState } from "react";
import { NOTICE_TIMEOUT_MS } from "@/constants";
import { INoticeType } from "../types";

interface UseNoticeReturn {
  notice: INoticeType | null;
  showNotice: (text: string, isError?: boolean) => void;
  clearNotice: () => void;
}

/** Self-clearing notice/toast state. */
export function useNotice(): UseNoticeReturn {
  const [notice, setNotice] = useState<INoticeType | null>(null);

  useEffect(() => {
    if (!notice?.text) return undefined;
    const tm = setTimeout(() => setNotice(null), NOTICE_TIMEOUT_MS);
    return () => clearTimeout(tm);
  }, [notice]);

  const showNotice = useCallback((text: string, isError = false) => {
    setNotice(text ? { text, isError } : null);
  }, []);

  const clearNotice = useCallback(() => setNotice(null), []);

  return { notice, showNotice, clearNotice };
}
