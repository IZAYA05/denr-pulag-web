import { forwardRef, SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: string[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      className = "",
      children,
      options,
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
        )}

        <select
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

            focus:border-emerald-500
            focus:ring-2
            focus:ring-emerald-500/20

            dark:border-zinc-700
            dark:bg-zinc-900
            dark:text-white

            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : ""
            }

            ${className}
          `}
        >
          {options
            ? options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))
            : children}
        </select>

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;