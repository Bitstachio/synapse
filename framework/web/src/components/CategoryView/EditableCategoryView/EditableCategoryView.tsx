import EditableFrameworkNode from "@/components/framework-nodes/EditableFrameworkNode/EditableFrameworkNode";
import { Category } from "@/types/framework";
import { ReactNode } from "react";
import CategoryContentView from "../CategoryContentView/CategoryContentView";

type EditableCategoryViewProps = {
  category: Category;
  onEdit: () => void;
  onAddSubcategory: () => void;
  children?: ReactNode;
  domId: string;
  highlighted?: boolean;
};

const EditableCategoryView = ({
  category,
  onEdit,
  onAddSubcategory,
  children,
  domId,
  highlighted,
}: EditableCategoryViewProps) => (
  <EditableFrameworkNode
    domId={domId}
    highlighted={highlighted}
    content={<CategoryContentView id={category.id} name={category.name} description={category.description} />}
    onEditContent={onEdit}
    onAddSubnode={onAddSubcategory}
  >
    {children}
  </EditableFrameworkNode>
);

export default EditableCategoryView;
