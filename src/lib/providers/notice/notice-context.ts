import { INotice } from "@/lib/types";
import { createContext } from "react";

export interface INoticeContextValue {
  notice: INotice | null;
  postNotice: (notice: INotice) => void;
  clearNotice: () => void;
}

export const NoticeContext = createContext<INoticeContextValue | null>(null);
