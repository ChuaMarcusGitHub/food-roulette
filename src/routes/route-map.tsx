import { HomePage, RecoverPage, GroupRoomPage } from "@pages";
import { RouteObject } from "react-router";
import { PATHS } from "./paths";
export const routes: RouteObject[] = [
  {
    path: PATHS.HOME,
    element: <HomePage />,
  },
  {
    path: PATHS.RECOVER,
    element: <RecoverPage />,
  },
  {
    path: PATHS.GROUP,
    element: <GroupRoomPage />,
  },
];
