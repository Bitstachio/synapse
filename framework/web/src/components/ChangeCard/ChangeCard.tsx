import { ReactNode } from "react";

type ChangeCardProps = {
  before: ReactNode;
  after: ReactNode;
};

const ChangeCard = ({ before, after }: ChangeCardProps) => {
  return (
    <div className="mt-1 space-y-1 text-sm">
      <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Before</span>
      <div className="mt-0.5 rounded border border-red-200 bg-red-50/50 px-3 py-2 text-zinc-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-zinc-200">
        {before}
      </div>
      <div>
        <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">After</span>
        <div className="mt-0.5 rounded border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-zinc-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-zinc-200">
          {after}
        </div>
      </div>
    </div>
  );
};

export default ChangeCard;
