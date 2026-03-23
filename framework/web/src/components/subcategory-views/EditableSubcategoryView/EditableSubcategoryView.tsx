import EditableFrameworkNode from "@/components/framework-nodes/EditableFrameworkNode/EditableFrameworkNode";
import EditableInstructionView from "@/components/instruction-views/EditableInstructionView/EditableInstructionView";
import { Subcategory } from "@/types/framework";
import SubcategoryContentView from "../SubcategoryContentView/SubcategoryContentView";

type EditableSubcategoryViewProps = {
  subcategory: Subcategory;
  onEdit: () => void;
  onAddInstruction: () => void;
};

const EditableSubcategoryView = ({ subcategory, onEdit, onAddInstruction }: EditableSubcategoryViewProps) => (
  <EditableFrameworkNode
    content={<SubcategoryContentView id={subcategory.id} name={subcategory.name} />}
    onEditContent={onEdit}
    onAddSubnode={onAddInstruction}
  >
    {subcategory.instructions.map((instruction) => (
      <EditableInstructionView key={instruction.id} instruction={instruction} onEdit={() => {}} />
    ))}
  </EditableFrameworkNode>
);

export default EditableSubcategoryView;
