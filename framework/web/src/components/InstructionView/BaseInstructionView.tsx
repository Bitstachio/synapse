import { cn } from "@/lib/tailwind";
import { ReactNode } from "react";

type BaseInstructionViewProps = {
  classExtension?: string;
  renderLabel?: () => ReactNode;
  renderActions?: () => ReactNode;
  renderContent: () => ReactNode;
};

const BaseInstructionView = ({
  classExtension,
  renderLabel,
  renderActions,
  renderContent,
}: BaseInstructionViewProps) => {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-2 rounded border px-2 py-2", // Layout
        "border-zinc-100 bg-white dark:border-zinc-700 dark:bg-zinc-900/30", // Default colors
        classExtension,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Instruction</p>
          {renderLabel?.()}
        </div>
        {renderContent()}
      </div>
      {renderActions?.()}
    </div>
  );
};

export default BaseInstructionView;
