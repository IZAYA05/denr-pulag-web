import type { InputHTMLAttributes } from "react";

interface TextInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  maxLength?: number;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  digitsOnly?: boolean;
  excludeNumbers?: boolean;
}

export default function TextInput({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  error,
  value,
  onChange,
  maxLength,
  inputMode,
  digitsOnly = false,
  excludeNumbers = false,
}: TextInputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="text-sm font-medium text-zinc-300"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        onChange={(event) => {
          let nextValue = event.currentTarget.value;

          if (digitsOnly) {
            nextValue = nextValue.replace(/[^0-9]/g, "");
          }

          if (excludeNumbers) {
            nextValue = nextValue.replace(/\p{N}/gu, "");
          }

          if (typeof maxLength === "number") {
            nextValue = nextValue.slice(0, maxLength);
          }

          if (event.currentTarget.value !== nextValue) {
            event.currentTarget.value = nextValue;
          }

          onChange?.(nextValue);
        }}
        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
