import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/types";
import { LOCALE_STORAGE_KEY } from "@/constants";
import { messages } from "./messages";

type MessageTree = { [key: string]: string | MessageTree };

function getNested(obj: MessageTree, path: string): string | undefined {
  const parts = path.split(".");
  let cur: string | MessageTree | undefined = obj;
  for (const p of parts) {
    if (typeof cur === "string" || cur === undefined) return undefined;
    cur = cur[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string>) => string;
  mounted: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface ProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: ProviderProps) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const s = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (s === "ja" || s === "en") setLocaleState(s);
    } catch {
      /* ignore */
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    if (l !== "en" && l !== "ja") return;
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = l;
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale;
  }, [locale, mounted]);

  const t = useCallback(
    (key: string, vars?: Record<string, string>): string => {
      let str = getNested(messages[locale], key);
      if (str === undefined) {
        str = getNested(messages.en, key);
      }
      if (str === undefined) return key;
      if (vars) {
        return str.replace(/\{(\w+)\}/g, (_, k: string) =>
          vars[k] != null ? String(vars[k]) : `{${k}}`
        );
      }
      return str;
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, mounted }),
    [locale, setLocale, t, mounted],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

/** Access the current locale, setter, and translation function. */
export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
