/** Notice displayed in the UI. */
export interface INotice {
  text: string;
  timeout?: number;
  variant?: NoticeVariant;
  className?: string;
}

export type NoticeVariant = "error" | "success";