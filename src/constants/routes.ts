export const ROUTES = {
  HOME: "/",
  RECOVER: "/recover",
  GROUP: (id: string) => `/group/${id}` as const,
} as const;
