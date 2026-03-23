import { cn } from "@/lib/tailwind";
import { ReactNode } from "react";

export type FrameworkNodeVariant = "regular" | "added" | "deleted" | "updated";

const VARIANT_CONTAINER_CLASS = {
  regular:
    "border-zinc-100 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/30",
  added:
    "border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/60 dark:bg-emerald-950/30",
  deleted:
    "border-red-200 bg-red-50/60 dark:border-red-800/60 dark:bg-red-950/30",
  updated:
    "border-yellow-200 bg-yellow-50/60 dark:border-yellow-800/60 dark:bg-yellow-950/30",
} satisfies Record<FrameworkNodeVariant, string>;

type FrameworkNodeProps = {
  content: ReactNode;
  labels?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  variant?: FrameworkNodeVariant;
};

const BaseFrameworkNode = ({
  content,
  labels,
  actions,
  children,
  variant = "regular",
}: FrameworkNodeProps) => (
  <li
    className={cn(
      "rounded border p-3",
      VARIANT_CONTAINER_CLASS[variant],
    )}
  >
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="flex flex-col gap-1">
        {labels && <div>{labels}</div>}
        <div>{content}</div>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
    {children && (
      <ul className="mt-2 ml-3 border-l-2 border-zinc-200 pl-3 dark:border-zinc-600">
        {children}
      </ul>
    )}
  </li>
);

export default BaseFrameworkNode;
