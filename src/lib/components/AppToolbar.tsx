import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/locale-provider";

/** Fixed top-right toolbar with language and theme toggles. */
export default function AppToolbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="fixed right-3 top-3 z-[100] h-9 w-32 rounded-lg bg-transparent"
        aria-hidden
      />
    );
  }

  const dark = resolvedTheme === "dark";

  return (
    <div className="fixed right-3 top-3 z-[100] flex flex-wrap items-center justify-end gap-1.5 rounded-xl border border-slate-200/80 bg-white/90 px-2 py-1.5 shadow-sm backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/90">
      <button
        type="button"
        onClick={() => setLocale(locale === "en" ? "ja" : "en")}
        className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {locale === "en" ? t("toolbar.langJa") : t("toolbar.langEn")}
      </button>
      <button
        type="button"
        onClick={() => setTheme(dark ? "light" : "dark")}
        className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        title={dark ? t("toolbar.themeLight") : t("toolbar.themeDark")}
      >
        {dark ? "☀️" : "🌙"}
      </button>
    </div>
  );
}
