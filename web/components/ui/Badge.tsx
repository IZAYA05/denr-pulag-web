import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?:
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "secondary";
  className?: string;
}

export default function Badge({
  children,
  variant = "secondary",
  className = "",
}: BadgeProps) {
  const variants = {
    success:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",

    warning:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",

    danger:
      "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",

    info:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",

    secondary:
      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}