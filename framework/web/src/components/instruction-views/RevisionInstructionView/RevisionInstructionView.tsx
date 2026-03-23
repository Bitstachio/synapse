import AddedFrameworkNode from "@/components/framework-nodes/revision-nodes/AddedFrameworkNode/AddedFrameworkNode";
import DeletedFrameworkNode from "@/components/framework-nodes/revision-nodes/DeletedFrameworkNode/DeletedFrameworkNode";
import UpdatedFrameworkNode from "@/components/framework-nodes/revision-nodes/UpdatedFrameworkNode/UpdatedFrameworkNode";
import { Instruction } from "@/types/framework";
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

type RevisionInstructionViewProps = AddProps | DeleteProps | UpdateProps;

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
    />
  ) : props.op === "deleted" ? (
    <DeletedFrameworkNode
      content={
        <InstructionContentView
          id={props.instruction.id}
          risk_level={props.instruction.risk_level}
          description={props.instruction.description}
        />
      }
    />
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
    />
  ) : null;

export default RevisionInstructionView;
