import { Instruction } from "@/types/framework";
import ChangeCard from "../ChangeCard/ChangeCard";
import BaseInstructionView from "./BaseInstructionView";
import InstructionContentView from "./InstructionContentView";

type AddProps = {
  op: "add";
  instruction: Instruction;
};

type DeleteProps = {
  op: "delete";
  instruction: Instruction;
};

type UpdateProps = {
  op: "update";
  before: Instruction;
  after: Instruction;
};

type RevisionInstructionViewProps = AddProps | DeleteProps | UpdateProps;

const RevisionInstructionView = (props: RevisionInstructionViewProps) => {
  return (
    <BaseInstructionView
      renderContent={() =>
        props.op === "add" || props.op === "delete" ? (
          <InstructionContentView
            id={props.instruction.id}
            riskLevel={props.instruction.risk_level}
            description={props.instruction.description}
          />
        ) : props.op === "update" ? (
          <ChangeCard
            before={
              <InstructionContentView
                id={props.before.id}
                riskLevel={props.before.risk_level}
                description={props.before.description}
              />
            }
            after={
              <InstructionContentView
                id={props.after.id}
                riskLevel={props.after.risk_level}
                description={props.after.description}
              />
            }
          />
        ) : null
      }
      classExtension={
        props.op === "add"
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
          : props.op === "delete"
            ? "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20"
            : props.op === "update"
              ? "border-yellow-200 bg-yellow-50/50 dark:border-yellow-900/50 dark:bg-yellow-950/20"
              : ""
      }
    />
  );
};

export default RevisionInstructionView;
