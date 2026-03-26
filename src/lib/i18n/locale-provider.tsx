import type { Locale, LocaleMap } from "@/types";
import { createContext, useState } from "react";
import { save } from "../local-storage";
import { BROWSER_LANGUAGE_KEY } from "@/constants";


interface LocaleContextValue {
  locale: Locale;
  texts: LocaleMap;
  onLocaleChange: (locale: Locale) => void;
}

interface ProviderProps {
  children: React.ReactNode;
  texts: LocaleMap; // <en, JSON.Object>
  browserLanguage: Locale;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  texts,
  browserLanguage,
}: ProviderProps) {
  const [locale, setLocale] = useState<Locale>(browserLanguage);

  const onLocaleChange = (locale: Locale) => {
    save(BROWSER_LANGUAGE_KEY, locale);
    setLocale(locale);
  };

  return (
    <LocaleContext.Provider value={{ locale, texts, onLocaleChange }}>
      {children}
    </LocaleContext.Provider>
  );
}
