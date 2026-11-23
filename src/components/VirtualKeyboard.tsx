interface VirtualKeyboardProps {
  onInput: (character: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

const ROWS = ['ABCDEFGHIJ', 'KLMNOPQRST', 'UVWXYZ0123', '456789-.'];

export function VirtualKeyboard({ onInput, onBackspace, onClear }: VirtualKeyboardProps) {
  return (
    <div className="vk" role="group" aria-label="Teclado en pantalla">
      {ROWS.map((row) => (
        <div className="vk-row" key={row}>
          {row.split('').map((character) => (
            <button
              key={character}
              type="button"
              className="vk-key"
              data-focusable
              onClick={() => onInput(character === '.' ? ' ' : character)}
            >
              {character === '.' ? 'ESP' : character}
            </button>
          ))}
        </div>
      ))}
      <div className="vk-actions">
        <button type="button" className="vk-key wide" data-focusable onClick={() => onInput(' ')}>
          Espacio
        </button>
        <button type="button" className="vk-key" data-focusable onClick={onBackspace}>
          Borrar
        </button>
        <button type="button" className="vk-key" data-focusable onClick={onClear}>
          Limpiar
        </button>
      </div>
    </div>
  );
}
