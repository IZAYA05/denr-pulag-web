type TextInputProps = {
  label: string;
  name: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
};

export default function TextInput({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  defaultValue,
  error,
}: TextInputProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
      />

      {error && (
        <p className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}