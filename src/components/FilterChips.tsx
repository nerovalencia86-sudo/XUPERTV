interface FilterChipsProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  autoFocusFirst?: boolean;
}

export function FilterChips({ options, value, onChange, autoFocusFirst }: FilterChipsProps) {
  return (
    <div className="chips" role="group" aria-label="Filtrar por categoría">
      {options.map((option, index) => (
        <button
          key={option}
          type="button"
          className={`chip ${option === value ? 'is-active' : ''}`}
          data-focusable
          data-autofocus={autoFocusFirst && index === 0 ? true : undefined}
          aria-pressed={option === value}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
