import EditableFrameworkNode from "@/components/framework-nodes/EditableFrameworkNode/EditableFrameworkNode";
import { Instruction } from "@/types/framework";
import InstructionContentView from "../InstructionContentView/InstructionContentView";

type EditableInstructionViewProps = {
  instruction: Instruction;
  onEdit: () => void;
  domId: string;
  highlighted?: boolean;
};

const EditableInstructionView = ({ instruction, onEdit, domId, highlighted }: EditableInstructionViewProps) => (
  <EditableFrameworkNode
    domId={domId}
    highlighted={highlighted}
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
