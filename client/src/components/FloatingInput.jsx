function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  error,
  disabled = false,
}) {
  const isFloating = Boolean(value);

  return (
    <label htmlFor={id} className="block">
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder=" "
          disabled={disabled}
          className={`peer input-shell ${error ? "border-red-400/50 focus:border-red-400 focus:shadow-[0_0_0_1px_rgba(248,113,113,1)]" : ""}`}
        />
        <span
          className={`pointer-events-none absolute left-4 text-apple-textMuted transition-all duration-200 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-apple-blue ${
            isFloating
              ? "top-3 translate-y-0 text-xs"
              : "top-1/2 -translate-y-1/2 text-sm"
          }`}
        >
          {label}
        </span>
      </div>
      <span className="mt-2 block min-h-5 text-xs text-red-400">{error || " "}</span>
    </label>
  );
}

export default FloatingInput;
