import { ReactNode } from "react";
import BaseFrameworkNode from "../BaseFrameworkNode/BaseFrameworkNode";
import FrameworkNodeActionButton from "../FrameworkNodeActionButton/FrameworkNodeActionButton";

type EditableFrameworkNodeProps = {
  content: ReactNode;
  onEditContent: () => void;
  onAddSubnode?: () => void;
  children?: ReactNode;
  domId?: string;
  highlighted?: boolean;
};

const EditableFrameworkNode = ({
  content,
  onEditContent,
  onAddSubnode,
  children,
  domId,
  highlighted,
}: EditableFrameworkNodeProps) => (
  <BaseFrameworkNode
    domId={domId}
    highlighted={highlighted}
    content={content}
    actions={
      <>
        <FrameworkNodeActionButton onClick={onEditContent} ariaLabel="Edit">
          Edit
        </FrameworkNodeActionButton>
        {onAddSubnode && (
          <FrameworkNodeActionButton onClick={onAddSubnode} ariaLabel="Add subnode">
            Add Subnode
          </FrameworkNodeActionButton>
        )}
      </>
    }
  >
    {children}
  </BaseFrameworkNode>
);

export default EditableFrameworkNode;
