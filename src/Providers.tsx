
import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/lib/i18n/context";

interface ProvidersProps {
  children: ReactNode;
}

/** Wraps the app in theme + locale providers. */
export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LocaleProvider>{children}</LocaleProvider>
    </ThemeProvider>
  );
}
