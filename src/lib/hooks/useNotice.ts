import { useCallback, useEffect, useState } from "react";
import type { Notice } from "@/types";
import { NOTICE_TIMEOUT_MS } from "@/constants";

interface UseNoticeReturn {
  notice: Notice | null;
  showNotice: (text: string, isError?: boolean) => void;
  clearNotice: () => void;
}

/** Self-clearing notice/toast state. */
export function useNotice(): UseNoticeReturn {
  const [notice, setNotice] = useState<Notice | null>(null);

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
