import { ReactNode } from "react";
import BaseFrameworkNode from "../BaseFrameworkNode/BaseFrameworkNode";
import FrameworkNodeActionButton from "../FrameworkNodeActionButton/FrameworkNodeActionButton";

type EditableFrameworkNodeProps = {
  content: ReactNode;
  onEditContent: () => void;
  onAddSubnode?: () => void;
  children?: ReactNode;
};

const EditableFrameworkNode = ({ content, onEditContent, onAddSubnode, children }: EditableFrameworkNodeProps) => (
  <BaseFrameworkNode
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
