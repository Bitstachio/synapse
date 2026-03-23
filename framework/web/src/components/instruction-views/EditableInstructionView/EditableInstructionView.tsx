import EditableFrameworkNode from "@/components/framework-nodes/EditableFrameworkNode/EditableFrameworkNode";
import { Instruction } from "@/types/framework";
import InstructionContentView from "../InstructionContentView/InstructionContentView";

type EditableInstructionViewProps = {
  instruction: Instruction;
  onEdit: () => void;
};

const EditableInstructionView = ({ instruction, onEdit }: EditableInstructionViewProps) => (
  <EditableFrameworkNode
    content={
      <InstructionContentView
        id={instruction.id}
        risk_level={instruction.risk_level}
        description={instruction.description}
      />
    }
    onEditContent={onEdit}
  />
);

export default EditableInstructionView;
