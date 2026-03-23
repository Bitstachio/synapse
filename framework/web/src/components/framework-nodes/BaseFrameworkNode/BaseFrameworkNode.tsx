import { ReactNode } from "react";

type FrameworkNodeProps = {
  content: ReactNode;
  labels?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

const FrameworkNode = ({ content, labels, actions, children }: FrameworkNodeProps) => (
  <li className="rounded border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-800/30">
    <div className="flex flex-wrap items-center items-start justify-between gap-2">
      <div className="flex flex-col gap-1">
        {labels && <div>{labels}</div>}
        <div>{content}</div>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
    {children && <ul className="mt-2 ml-3 border-l-2 border-zinc-200 pl-3 dark:border-zinc-600">{children}</ul>}
  </li>
);

export default FrameworkNode;
