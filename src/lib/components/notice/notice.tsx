import { useNotice } from "@/lib/hooks";
import {
  INotice,
  ITransitionProps,
  NoticeVariant,
  Transitions,
} from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Transition } from "@headlessui/react";
import { useState } from "react";

const variantClasses: Record<NoticeVariant, string> = {
  error:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200",
  success:
    "border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-100",
};
const transitionClasses: Record<Transitions, ITransitionProps> = {
  fade: {
    enter: "transition-opacity duration-200",
    enterFrom: "opacity-0",
    enterTo: "opacity-100",
    leave: "transition-opacity duration-200",
    leaveFrom: "opacity-100",
    leaveTo: "opacity-0",
  },
};

export const Notice = () => {
  const { notice } = useNotice();
  const [_notice, setNotice] = useState<INotice | null>(null);

  if (notice && notice !== _notice) {
    setNotice(notice);
  }
  return (
    <Transition
      show={notice !== null}
      {...transitionClasses[_notice?.transition ?? "fade"]}
    >
      <div
        role="status"
        className={cn([
          "rounded-lg border px-3 py-2 text-sm mt-6",
          variantClasses[_notice?.variant ?? "success"],
          _notice?.className,
        ])}
      >
        {_notice?.text}
      </div>
    </Transition>
  );
};
