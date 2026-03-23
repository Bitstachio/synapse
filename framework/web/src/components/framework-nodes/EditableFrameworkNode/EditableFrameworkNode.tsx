import { ReactNode } from "react";
import FrameworkNode from "../BaseFrameworkNode/BaseFrameworkNode";
import FrameworkNodeActionButton from "../FrameworkNodeActionButton/FrameworkNodeActionButton";

type EditableFrameworkNodeProps = {
  content: ReactNode;
  onEditContent: () => void;
  onAddSubnode?: () => void;
  children?: ReactNode;
};

const EditableFrameworkNode = ({ content, onEditContent, onAddSubnode, children }: EditableFrameworkNodeProps) => (
  <FrameworkNode
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
  </FrameworkNode>
);

export default EditableFrameworkNode;
