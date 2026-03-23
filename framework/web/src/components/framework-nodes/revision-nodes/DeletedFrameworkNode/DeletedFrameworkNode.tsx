import RevisionOpBadge from "@/components/RevisionOpBadge/RevisionOpBadge";
import { RevisionOp } from "@/types/revision";
import { ReactNode } from "react";
import BaseFrameworkNode from "../../BaseFrameworkNode/BaseFrameworkNode";

const op: RevisionOp = "deleted";

type DeletedFrameworkNodeProps = {
  content: ReactNode;
  children?: ReactNode;
};

const DeletedFrameworkNode = ({ content, children }: DeletedFrameworkNodeProps) => (
  <BaseFrameworkNode variant={op} content={content} labels={<RevisionOpBadge op={op} />}>
    {children}
  </BaseFrameworkNode>
);

export default DeletedFrameworkNode;
