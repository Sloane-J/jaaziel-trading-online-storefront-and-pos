import { useState } from "react";
import { DeleteIcon } from "lucide-react";

type NumpadProps = {
  value: string;
  onChange: (value: string) => void;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"];

export function Numpad({ value, onChange }: NumpadProps) {
  const [pressed, setPressed] = useState<string | null>(null);

  function pressKey(key: string) {
    if (key === "back") {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === "." && value.includes(".")) return;
    if (value.replace(".", "").length >= 9) return; // sane upper bound
    onChange(value + key);
  }

  function handleKeyDown(e: React.KeyboardEvent, key: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pressKey(key);
    }
  }

  function handlePointerDown(key: string) {
    setPressed(key);
  }

  function handlePointerUp() {
    setPressed(null);
  }

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {KEYS.map((key) => {
        const isBack = key === "back";
        const isPressed = pressed === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => pressKey(key)}
            onKeyDown={(e) => handleKeyDown(e, key)}
            onPointerDown={() => handlePointerDown(key)}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            aria-label={isBack ? "Backspace" : key === "." ? "Decimal point" : `Digit ${key}`}
            className={`flex h-16 items-center justify-center rounded-full text-2xl font-semibold transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              isBack
                ? "border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/15"
                : "border border-border bg-card text-foreground hover:bg-accent"
            } ${
              isPressed
                ? "translate-y-0.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                : "shadow-[0_2px_0_0_var(--border),0_3px_6px_rgba(0,0,0,0.08)]"
            }`}
          >
            {isBack ? <DeleteIcon className="size-6" /> : key}
          </button>
        );
      })}
    </div>
  );
}