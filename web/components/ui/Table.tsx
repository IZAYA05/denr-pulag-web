import { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export default function Table({
  children,
  className = "",
}: TableProps) {
  return (
    <div
      className={`
        overflow-visible
        rounded-3xl
        border
        border-zinc-200
        bg-white
        shadow-sm
        dark:border-zinc-800
        dark:bg-zinc-950
        ${className}
      `}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {children}
        </table>
      </div>
    </div>
  );
}