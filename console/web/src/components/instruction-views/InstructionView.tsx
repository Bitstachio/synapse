import { Instruction } from "@/types/framework";

type InstructionViewProps =
  | { instruction: Instruction; isEditable: true; onEdit: () => void }
  | { instruction: Instruction; isEditable?: false; onEdit?: never };

const InstructionView = (props: InstructionViewProps) => {
  const { instruction } = props;
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 rounded border border-zinc-100 bg-white py-2 pr-2 pl-2 dark:border-zinc-700 dark:bg-zinc-900/30">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Instruction</p>
        <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{instruction.id}</span>
        <span
          className="ml-2 rounded px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
          title="Risk level"
        >
          {instruction.risk_level}
        </span>
        <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">{instruction.description}</p>
      </div>
      {props.isEditable && (
        <button
          type="button"
          onClick={props.onEdit}
          className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          aria-label="Edit instruction"
        >
          Edit
        </button>
      )}
    </div>
  );
};

export default InstructionView;
