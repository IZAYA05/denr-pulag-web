"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./Theme";

type ThemeToggleProps = {
  className?: string;
  iconSize?: string;
};

export default function ThemeToggle({
  className = "h-6 w-6 rounded-lg",
  iconSize = "h-5 w-5",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`
        flex items-center justify-center
        border border-zinc-200
        bg-white
        transition-all
        hover:bg-zinc-100
        dark:border-white/10
        dark:bg-zinc-900
        dark:hover:bg-zinc-800
        ${className}
      `}
    >
      {theme === "dark" ? (
        <Sun className={`${iconSize} text-yellow-400`} />
      ) : (
        <Moon className={`${iconSize} text-zinc-700`} />
      )}
    </button>
  );
}