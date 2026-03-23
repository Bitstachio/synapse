import { cn } from "@/lib/tailwind";
import { ReactNode } from "react";

type BaseInstructionViewProps = {
  content: ReactNode;
  labels?: ReactNode;
  actions?: ReactNode;
  classExtension?: string;
};

const BaseInstructionView = ({ content, labels, actions, classExtension }: BaseInstructionViewProps) => {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-2 rounded border px-2 py-2", // Layout
        "border-zinc-100 bg-white dark:border-zinc-700 dark:bg-zinc-900/30", // Default colors
        classExtension,
      )}
    >
      <div className="min-w-0 flex-1">
        {labels && <div>{labels}</div>}
        <div>{content}</div>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
};

export default BaseInstructionView;
