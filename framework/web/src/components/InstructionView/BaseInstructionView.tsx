import { BaseInstruction } from "@/types/framework";
import { ReactNode } from "react";

type BaseInstructionViewProps = BaseInstruction & {
  renderActions?: () => ReactNode;
  renderContent: () => ReactNode;
};

const BaseInstructionView = ({ id, risk_level, renderActions, renderContent }: BaseInstructionViewProps) => {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 rounded border border-zinc-100 bg-white py-2 pr-2 pl-2 dark:border-zinc-700 dark:bg-zinc-900/30">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Instruction</p>
        <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{id}</span>
        <span
          className="ml-2 rounded px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
          title="Risk level"
        >
          {risk_level}
        </span>
        {renderContent()}
      </div>
      {renderActions?.()}
    </div>
  );
};

export default BaseInstructionView;
