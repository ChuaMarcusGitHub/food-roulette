import { cn } from "@/lib/utils/cn";
import { Notice } from "../notice";
import { Outlet } from "react-router-dom";

/**
 * Base layout component for the different sections of the food-roulette app.
 * comes with the classStyle [ma-auto max-w-lg px-4] to contrain the content to the center and expand from there
 * any additional styles can be passed via the className prop
 * @param className
 * @returns
 */
export const BaseLayout = ({ className }: { className?: string }) => {
  return (
    <main className={cn("mx-auto max-w-lg px-4", className)}>
      <Notice />
      <Outlet />
    </main>
  );
};
