import type { Locale } from "@/types";

let _locale: Locale = "en";
let _messages: Record<string, unknown> = {};

/** Called by LocaleProvider whenever the locale changes. */
export const sync = (locale: Locale, messages: Record<string, unknown>) => {
  _locale = locale;
  _messages = messages;
};

interface TranslateOptions {
  defaultValue?: unknown;
  [key: string]: unknown;
}

const interpolate = (
  template: string,
  vars: Record<string, unknown>,
): string => {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
};

const translate = (key: string, options?: TranslateOptions): string => {
  const { defaultValue, ...vars } = options ?? {};
  const keys = key.split(".");
  let current: unknown = _messages;

  for (const k of keys) {
    if (typeof current !== "object" || current === null) {
      return defaultValue !== undefined ? String(defaultValue) : key;
    }
    current = (current as Record<string, unknown>)[k];
  }

  if (typeof current === "string") return interpolate(current, vars);
  return defaultValue !== undefined ? String(defaultValue) : key;
};

export { translate as t };
export const getLocale = () => _locale;
