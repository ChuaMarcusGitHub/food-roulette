import { useContext } from "react";
import { NoticeContext } from "../providers";

export function useNotice() {
  const context = useContext(NoticeContext);
  if (!context) throw new Error("useNotice must be used within NoticeProvider");
  return context;
}
