import type { Location } from "@/types";

export const placeLabel = (
  loc: Location | undefined,
  fallback: string,
): string => {
  return loc?.name?.trim() || fallback;
};
