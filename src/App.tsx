import Providers from "@/providers";
import { AppToolbar, Notice } from "@/lib/components";

import { RouterProvider } from "react-router";
import { appRouter } from "@routes";

export default function App() {
  return (
    <Providers>
      <Notice />
      <AppToolbar />
      <RouterProvider router={appRouter} />
    </Providers>
  );
}
