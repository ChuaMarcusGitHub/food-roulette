import { HomePage, RecoverPage, GroupRoomPage } from "@pages";
import { RouteObject } from "react-router";
import { PATHS } from "./paths";
import { GroupRoomLayout, RootLayout } from "@/lib/components/layout";
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: PATHS.HOME,
        element: <HomePage />,
      },
      {
        path: PATHS.RECOVER,
        element: <RecoverPage />,
      },
    ],
  },
  {
    path: PATHS.GROUP,
    element: <GroupRoomLayout />,
    children: [
      {
        path: PATHS.GROUP,
        element: <GroupRoomPage />,
      },
    ],
  },
];
