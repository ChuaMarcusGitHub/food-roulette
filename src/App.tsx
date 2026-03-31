import Providers from "@/providers";
import AppToolbar from "@/lib/components/AppToolbar";

import { RouterProvider } from "react-router";
import { appRouter } from "@routes";

export default function App() {
  return (
    <Providers>
      <AppToolbar />
      <RouterProvider router={appRouter} />
      {/* <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.RECOVER} element={<RecoverPage />} />
          <Route path="/group/:groupId" element={<GroupRoomPage />} />
        </Routes> */}
    </Providers>
  );
}
