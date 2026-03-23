import EditableInstructionView from "@/components/instruction-views/EditableInstructionView/EditableInstructionView";
import { Subcategory } from "@/types/framework";
import BaseSubcategoryView from "../BaseSubcategoryView/BaseSubcategoryView";
import SubcategoryContentView from "../SubcategoryContentView/SubcategoryContentView";

type EditableSubcategoryViewProps = {
  subcategory: Subcategory;
  onEdit: () => void; // TODO: Incorporate
  onAddInstruction: () => void; // TODO: Incorporate
};

const EditableSubcategoryView = ({ subcategory, onEdit, onAddInstruction }: EditableSubcategoryViewProps) => {
  return (
    <BaseSubcategoryView content={<SubcategoryContentView id={subcategory.id} name={subcategory.name} />}>
      {subcategory.instructions.map((instruction) => (
        <EditableInstructionView key={instruction.id} instruction={instruction} onEdit={() => {}} />
      ))}
    </BaseSubcategoryView>
  );
};

export default EditableSubcategoryView;
