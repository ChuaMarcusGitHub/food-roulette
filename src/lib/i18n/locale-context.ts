import type { Locale, LocaleMap } from "@/types";
import { createContext } from "react";

export interface LocaleContextValue {
  locale: Locale;
  texts: LocaleMap;
  onLocaleChange: (locale: Locale) => void;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);
