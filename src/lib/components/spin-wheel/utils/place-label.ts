import { ILocation } from "@/lib/types";

export const placeLabel = (
  loc: ILocation | undefined,
  fallback: string,
): string => {
  return loc?.name?.trim() || fallback;
};
