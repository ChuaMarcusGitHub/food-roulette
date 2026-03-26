import { BrowserRouter, Routes, Route } from "react-router-dom";
import Providers from "@/providers";
import AppToolbar from "@/lib/components/AppToolbar";
import HomePage from "@/pages/HomePage";
import GroupRoomPage from "@/pages/GroupRoomPage";
import RecoverPage from "@/pages/RecoverPage";
import { ROUTES } from "@/constants";

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        <AppToolbar />
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.RECOVER} element={<RecoverPage />} />
          <Route path="/group/:groupId" element={<GroupRoomPage />} />
        </Routes>
      </Providers>
    </BrowserRouter>
  );
}
