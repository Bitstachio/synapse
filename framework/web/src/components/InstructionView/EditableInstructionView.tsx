import { Instruction } from "@/types/framework";
import BaseInstructionView from "./BaseInstructionView";
import InstructionContentView from "./InstructionContentView";

type EditableInstructionViewProps = {
  instruction: Instruction;
  onEdit: () => void;
};

const EditableInstructionView = ({ instruction, onEdit }: EditableInstructionViewProps) => {
  return (
    <BaseInstructionView
      renderActions={() => (
        <button
          type="button"
          onClick={onEdit}
          className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          aria-label="Edit instruction"
        >
          Edit
        </button>
      )}
      renderContent={() => (
        <InstructionContentView
          id={instruction.id}
          riskLevel={instruction.risk_level}
          description={instruction.description}
        />
      )}
    />
  );
};

export default EditableInstructionView;
