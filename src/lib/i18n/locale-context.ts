import type { Locale, LocaleMap } from "@/types";
import { createContext } from "react";

export interface ILocaleContextValue {
  locale: Locale;
  texts: LocaleMap;
  onLocaleChange: (locale: Locale) => void;
}

export const LocaleContext = createContext<ILocaleContextValue | null>(null);
