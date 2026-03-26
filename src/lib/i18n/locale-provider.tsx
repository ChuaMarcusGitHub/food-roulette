import type { Locale, LocaleMap } from "@/types";
import { useState } from "react";
import { save } from "../local-storage";
import { BROWSER_LANGUAGE_KEY } from "@/constants";
import { LocaleContext } from "./locale-context";
import { sync } from "@translate";
import React from "react";

interface ProviderProps {
  children: React.ReactNode;
  texts: LocaleMap;
  browserLanguage: Locale;
}

export function LocaleProvider({
  children,
  texts,
  browserLanguage,
}: ProviderProps) {
  const [locale, setLocale] = useState<Locale>(() => {
    sync(browserLanguage, texts[browserLanguage]);
    return browserLanguage;
  });

  const onLocaleChange = (next: Locale) => {
    sync(next, texts[next]);
    save(BROWSER_LANGUAGE_KEY, next);
    setLocale(next);
  };

  return (
    <LocaleContext.Provider value={{ locale, texts, onLocaleChange }}>
      <React.Fragment key={locale}>{children}</React.Fragment>
    </LocaleContext.Provider>
  );
}
