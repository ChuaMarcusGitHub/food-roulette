import Providers from "@/providers";
import { AppToolbar } from "@/lib/components";

import { RouterProvider } from "react-router";
import { appRouter } from "@routes";

export default function App() {
  return (
    <Providers>
      <AppToolbar />
      <RouterProvider router={appRouter} />
    </Providers>
  );
}
