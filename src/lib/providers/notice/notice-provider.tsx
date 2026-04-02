import { INotice } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import { NoticeContext } from "./notice-context";
import { NOTICE_TIMEOUT_MS } from "@/constants";

interface IProviderProps {
  children: React.ReactNode;
}
export const NoticeProvider = ({ children }: IProviderProps) => {
  const [notice, setNotice] = useState<INotice | null>(null);

  const postNotice = useCallback(
    (notice: INotice) => setNotice(notice),
    [],
  );

  const clearNotice = useCallback(() => setNotice(null), []);

  useEffect(() => {
    if (!notice?.text) return;
    const tm = setTimeout(() => clearNotice(), notice.timeout ?? NOTICE_TIMEOUT_MS);
    return () => clearTimeout(tm);
  }, [clearNotice, notice]);

  return (
    <NoticeContext.Provider value={{ notice, postNotice, clearNotice }}>
      {children}
    </NoticeContext.Provider>
  );
};
