import AddedFrameworkNode from "@/components/framework-nodes/revision-nodes/AddedFrameworkNode/AddedFrameworkNode";
import DeletedFrameworkNode from "@/components/framework-nodes/revision-nodes/DeletedFrameworkNode/DeletedFrameworkNode";
import UpdatedFrameworkNode from "@/components/framework-nodes/revision-nodes/UpdatedFrameworkNode/UpdatedFrameworkNode";
import { Instruction } from "@/types/framework";
import { ReactNode } from "react";
import InstructionContentView from "../InstructionContentView/InstructionContentView";

type AddProps = {
  op: "added";
  instruction: Instruction;
};

type DeleteProps = {
  op: "deleted";
  instruction: Instruction;
};

type UpdateProps = {
  op: "updated";
  before: Instruction;
  after: Instruction;
};

type RevisionInstructionViewProps = (AddProps | DeleteProps | UpdateProps) & { children?: ReactNode };

const RevisionInstructionView = (props: RevisionInstructionViewProps) =>
  props.op === "added" ? (
    <AddedFrameworkNode
      content={
        <InstructionContentView
          id={props.instruction.id}
          risk_level={props.instruction.risk_level}
          description={props.instruction.description}
        />
      }
    >
      {props.children}
    </AddedFrameworkNode>
  ) : props.op === "deleted" ? (
    <DeletedFrameworkNode
      content={
        <InstructionContentView
          id={props.instruction.id}
          risk_level={props.instruction.risk_level}
          description={props.instruction.description}
        />
      }
    >
      {props.children}
    </DeletedFrameworkNode>
  ) : props.op === "updated" ? (
    <UpdatedFrameworkNode
      before={
        <InstructionContentView
          id={props.before.id}
          risk_level={props.before.risk_level}
          description={props.before.description}
        />
      }
      after={
        <InstructionContentView
          id={props.after.id}
          risk_level={props.after.risk_level}
          description={props.after.description}
        />
      }
    >
      {props.children}
    </UpdatedFrameworkNode>
  ) : null;

export default RevisionInstructionView;
