type FrameworkNodeActionButtonProps = {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
};

const FrameworkNodeActionButton = ({ onClick, ariaLabel, children }: FrameworkNodeActionButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default FrameworkNodeActionButton;
