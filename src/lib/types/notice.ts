import { Transitions } from "./transitions";

/** Notice displayed in the UI. */
export interface INotice {
  text: string;
  timeout?: number;
  variant?: NoticeVariant;
  transition?: Transitions;
  className?: string;
}

export type NoticeVariant = "error" | "success";
