import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    babel({ presets: [reactCompilerPreset()] }) as any,
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@translate": path.resolve(__dirname, "src/lib/i18n/translate.ts"),
      "@style": path.resolve(__dirname, "src/lib/styles"),
      "@routes": path.resolve(__dirname, "src/routes"),
      "@pages": path.resolve(__dirname, "src/pages"),
    },
  },
});
