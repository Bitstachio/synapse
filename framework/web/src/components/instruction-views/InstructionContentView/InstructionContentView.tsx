import { Instruction } from "@/types/framework";

type InstructionContentViewProps = Pick<Instruction, "id" | "risk_level" | "description">;

const InstructionContentView = ({ id, risk_level, description }: InstructionContentViewProps) => (
  <article>
    <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400" title="ID">
      {id}
    </span>
    <span
      className="ml-2 rounded px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
      title="Risk level"
    >
      {risk_level}
    </span>
    <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">{description}</p>
  </article>
);

export default InstructionContentView;
