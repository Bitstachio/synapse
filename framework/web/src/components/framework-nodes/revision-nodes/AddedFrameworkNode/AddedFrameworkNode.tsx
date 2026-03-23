import RevisionOpBadge from "@/components/RevisionOpBadge/RevisionOpBadge";
import { RevisionOp } from "@/types/revision";
import { ReactNode } from "react";
import BaseFrameworkNode from "../../BaseFrameworkNode/BaseFrameworkNode";

const op: RevisionOp = "added";

type AddedFrameworkNodeProps = {
  content: ReactNode;
  children?: ReactNode;
};

const AddedFrameworkNode = ({ content, children }: AddedFrameworkNodeProps) => (
  <BaseFrameworkNode variant={op} content={content} labels={<RevisionOpBadge op={op} />}>
    {children}
  </BaseFrameworkNode>
);

export default AddedFrameworkNode;
