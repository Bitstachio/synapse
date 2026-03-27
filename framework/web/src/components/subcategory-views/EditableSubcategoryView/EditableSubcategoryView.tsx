import EditableFrameworkNode from "@/components/framework-nodes/EditableFrameworkNode/EditableFrameworkNode";
import { Subcategory } from "@/types/framework";
import { ReactNode } from "react";
import SubcategoryContentView from "../SubcategoryContentView/SubcategoryContentView";

type EditableSubcategoryViewProps = {
  subcategory: Subcategory;
  onEdit: () => void;
  onAddInstruction: () => void;
  children?: ReactNode;
  domId: string;
  highlighted?: boolean;
};

const EditableSubcategoryView = ({
  subcategory,
  onEdit,
  onAddInstruction,
  children,
  domId,
  highlighted,
}: EditableSubcategoryViewProps) => (
  <EditableFrameworkNode
    domId={domId}
    highlighted={highlighted}
    content={<SubcategoryContentView id={subcategory.id} name={subcategory.name} />}
    onEditContent={onEdit}
    onAddSubnode={onAddInstruction}
  >
    {children}
  </EditableFrameworkNode>
);

export default EditableSubcategoryView;
