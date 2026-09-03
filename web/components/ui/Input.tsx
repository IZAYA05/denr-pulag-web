import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
        )}

        <input
          ref={ref}
          {...props}
          className={`
            w-full
            rounded-2xl
            border
            border-zinc-200
            bg-white
            px-4
            py-3
            text-sm
            text-zinc-900
            outline-none
            transition
            placeholder:text-zinc-400
            focus:border-emerald-500
            focus:ring-2
            focus:ring-emerald-500/20

            dark:border-zinc-700
            dark:bg-zinc-900
            dark:text-white
            dark:placeholder:text-zinc-500

            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}

            ${className}
          `}
        />

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;