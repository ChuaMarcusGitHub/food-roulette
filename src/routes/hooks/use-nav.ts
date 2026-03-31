import { useNavigate } from "react-router-dom";

function resolvePath(
  route: string,
  params: Record<string, unknown> = {},
): string {
  return Object.entries(params).reduce<string>(
    (path, [key, value]) => path.replace(`:${key}`, String(value)),
    route,
  );
}
interface INavigateOptions {
  params?: Record<string, unknown>;
  newWindow?: boolean;
}
export function useNav() {
  const navigate = useNavigate();

  const nav = (route: string, args: INavigateOptions) => {
    const { params, newWindow = false } = args;
    const path = resolvePath(route, params);
    if (newWindow) window.open(path, "_blank");
    else navigate(path);
  };

  return {
    nav,
  };
}
