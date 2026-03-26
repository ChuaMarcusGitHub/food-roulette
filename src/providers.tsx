import { useMemo, type ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/lib/i18n/locale-provider";
import { get } from "./lib/local-storage";
import { BROWSER_LANGUAGE_KEY } from "./constants";
import { Locale, LocaleMap } from "./types";

import { en, jp } from "./localization";
interface ProvidersProps {
  children: ReactNode;
}
const languageMap: LocaleMap = {
  en: en,
  jp: jp,
};
const VALID_LOCALES = Object.keys(languageMap);

/** Wraps the app in theme + locale providers. */
export default function Providers({ children }: ProvidersProps) {
  const browserLanguage: Locale = useMemo(() => {
    const stored = get<Locale>(BROWSER_LANGUAGE_KEY);
    return stored && VALID_LOCALES.includes(stored) ? stored : "en";
  }, []);
  
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LocaleProvider browserLanguage={browserLanguage} texts={languageMap}>
        {children}
      </LocaleProvider>
    </ThemeProvider>
  );
}
