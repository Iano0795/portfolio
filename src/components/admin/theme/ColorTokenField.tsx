type ColorTokenFieldProps = {
  description?: string;
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
};

export function ColorTokenField({ description, disabled, label, onChange, value }: ColorTokenFieldProps) {
  const inputId = `theme-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const colorInputValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000';

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block font-mono text-xs text-gray-300">
        {label}
      </label>
      <div className="grid grid-cols-[44px_minmax(0,1fr)] gap-2">
        <input
          id={inputId}
          type="color"
          value={colorInputValue}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="h-10 w-11 cursor-pointer border border-cyan-400/20 bg-[#050812] p-1 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          maxLength={7}
          className="w-full border border-cyan-400/20 bg-[#050812]/80 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="#00ff88"
          aria-label={`${label} hex value`}
        />
      </div>
      {description && <p className="mt-1 font-mono text-[10px] text-gray-500">{description}</p>}
    </div>
  );
}
