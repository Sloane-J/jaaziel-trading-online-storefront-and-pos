import { DeleteIcon } from "lucide-react";

type NumpadProps = {
  value: string;
  onChange: (value: string) => void;
};

const KEYS = [
  { label: "1", color: "bg-amber-50 hover:bg-amber-100 text-amber-900" },
  { label: "2", color: "bg-rose-50 hover:bg-rose-100 text-rose-900" },
  { label: "3", color: "bg-sky-50 hover:bg-sky-100 text-sky-900" },
  { label: "4", color: "bg-lime-50 hover:bg-lime-100 text-lime-900" },
  { label: "5", color: "bg-violet-50 hover:bg-violet-100 text-violet-900" },
  { label: "6", color: "bg-orange-50 hover:bg-orange-100 text-orange-900" },
  { label: "7", color: "bg-teal-50 hover:bg-teal-100 text-teal-900" },
  { label: "8", color: "bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-900" },
  { label: "9", color: "bg-cyan-50 hover:bg-cyan-100 text-cyan-900" },
  { label: ".", color: "bg-stone-100 hover:bg-stone-200 text-stone-900" },
  { label: "0", color: "bg-emerald-50 hover:bg-emerald-100 text-emerald-900" },
  { label: "back", color: "bg-red-50 hover:bg-red-100 text-red-900" },
];

export function Numpad({ value, onChange }: NumpadProps) {
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

  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((key) => (
        <button
          key={key.label}
          type="button"
          onClick={() => pressKey(key.label)}
          onKeyDown={(e) => handleKeyDown(e, key.label)}
          aria-label={key.label === "back" ? "Backspace" : `Digit ${key.label}`}
          className={`flex h-16 items-center justify-center rounded-md text-2xl font-semibold shadow-sm transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${key.color}`}
        >
          {key.label === "back" ? <DeleteIcon className="size-6" /> : key.label}
        </button>
      ))}
    </div>
  );
}