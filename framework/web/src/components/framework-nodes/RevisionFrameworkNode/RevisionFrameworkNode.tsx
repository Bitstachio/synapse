import ChangeCard from "@/components/ChangeCard/ChangeCard";
import { ReactNode } from "react";
import BaseFrameworkNode from "../BaseFrameworkNode/BaseFrameworkNode";

type AddProps = {
  op: "added";
  content: ReactNode;
};

type DeleteProps = {
  op: "deleted";
  content: ReactNode;
};

type UpdateProps = {
  op: "updated";
  before: ReactNode;
  after: ReactNode;
};

type RevisionFrameworkNodeProps = (AddProps | DeleteProps | UpdateProps) & { children?: ReactNode };

const RevisionFrameworkNode = (props: RevisionFrameworkNodeProps) => (
  <BaseFrameworkNode
    variant={props.op}
    content={
      props.op === "added" || props.op === "deleted" ? (
        props.content
      ) : props.op === "updated" ? (
        <ChangeCard before={props.before} after={props.after} />
      ) : null
    }
  >
    {props.children}
  </BaseFrameworkNode>
);

export default RevisionFrameworkNode;
