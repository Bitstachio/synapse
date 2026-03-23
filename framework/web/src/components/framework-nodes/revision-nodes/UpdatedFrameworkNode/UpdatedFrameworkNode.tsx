import ChangeCard from "@/components/ChangeCard/ChangeCard";
import RevisionOpBadge from "@/components/RevisionOpBadge/RevisionOpBadge";
import { RevisionOp } from "@/types/revision";
import { ReactNode } from "react";
import BaseFrameworkNode from "../../BaseFrameworkNode/BaseFrameworkNode";

const op: RevisionOp = "updated";

type UpdatedFrameworkNodeProps = {
  before: ReactNode;
  after: ReactNode;
  children?: ReactNode;
};

const UpdatedFrameworkNode = ({ before, after, children }: UpdatedFrameworkNodeProps) => (
  <BaseFrameworkNode
    variant={op}
    content={<ChangeCard before={before} after={after} />}
    labels={<RevisionOpBadge op={op} />}
  >
    {children}
  </BaseFrameworkNode>
);

export default UpdatedFrameworkNode;
