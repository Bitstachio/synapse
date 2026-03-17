import { BaseInstruction, Instruction } from "@/types/framework";
import ChangeCard from "../ChangeCard/ChangeCard";
import BaseInstructionView from "./BaseInstructionView";
import InstructionContentView from "./InstructionContentView";

type RevisionInstructionViewProps = BaseInstruction & {
  before: Instruction;
  after: Instruction;
};

const RevisionInstructionView = ({ id, risk_level, before, after }: RevisionInstructionViewProps) => {
  return (
    <BaseInstructionView
      id={id}
      risk_level={risk_level}
      renderContent={() => (
        <ChangeCard
          before={
            <InstructionContentView id={before.id} riskLevel={before.risk_level} description={before.description} />
          }
          after={<InstructionContentView id={after.id} riskLevel={after.risk_level} description={after.description} />}
        />
      )}
    />
  );
};

export default RevisionInstructionView;
