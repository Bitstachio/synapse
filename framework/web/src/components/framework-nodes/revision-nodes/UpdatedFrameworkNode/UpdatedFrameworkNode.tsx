import ChangeCard from "@/components/ChangeCard/ChangeCard";
import RevisionOpBadge from "@/components/RevisionOpBadge/RevisionOpBadge";
import { RevisionOp } from "@/types/revision";
import { ReactNode } from "react";
import BaseFrameworkNode from "../../BaseFrameworkNode/BaseFrameworkNode";

const op: RevisionOp = "updated";

const NESTED_REVISION_LIST_CLASS =
  "mt-2 ml-3 space-y-1.5 border-l-2 border-zinc-200 pl-3 dark:border-zinc-600";

type UpdatedFrameworkNodeProps = {
  before: ReactNode;
  after: ReactNode;
  children?: ReactNode;
};

const UpdatedFrameworkNode = ({ before, after, children }: UpdatedFrameworkNodeProps) => (
  <BaseFrameworkNode
    variant={op}
    content={
      <ChangeCard before={before} after={after}>
        {children ? <ul className={NESTED_REVISION_LIST_CLASS}>{children}</ul> : null}
      </ChangeCard>
    }
    labels={<RevisionOpBadge op={op} />}
  />
);

export default UpdatedFrameworkNode;
