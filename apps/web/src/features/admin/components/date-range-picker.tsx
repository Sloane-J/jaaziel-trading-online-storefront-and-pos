import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DateRange } from "@/lib/api/reports";

type Preset = {
  label: string;
  getRange: () => DateRange;
};

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const PRESETS: Preset[] = [
  {
    label: "Today",
    getRange: () => ({ start: toISODate(new Date()), end: toISODate(new Date()) }),
  },
  {
    label: "7 days",
    getRange: () => ({ start: toISODate(daysAgo(6)), end: toISODate(new Date()) }),
  },
  {
    label: "30 days",
    getRange: () => ({ start: toISODate(daysAgo(29)), end: toISODate(new Date()) }),
  },
  {
    label: "This month",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: toISODate(start), end: toISODate(now) };
    },
  },
];

type DateRangePickerProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  activePresetLabel: string | null;
  onPresetChange: (label: string | null) => void;
};

export function DateRangePicker({
  value,
  onChange,
  activePresetLabel,
  onPresetChange,
}: DateRangePickerProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(value.start);
  const [draftEnd, setDraftEnd] = useState(value.end);

  function handlePresetClick(preset: Preset) {
    onChange(preset.getRange());
    onPresetChange(preset.label);
    setCustomOpen(false);
  }

  function handleCustomApply() {
    if (!draftStart || !draftEnd) return;
    onChange({ start: draftStart, end: draftEnd });
    onPresetChange(null);
    setCustomOpen(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => (
        <Button
          key={preset.label}
          type="button"
          size="sm"
          variant={activePresetLabel === preset.label ? "default" : "outline"}
          className="rounded-full"
          onClick={() => handlePresetClick(preset)}
        >
          {preset.label}
        </Button>
      ))}

      <Popover open={customOpen} onOpenChange={setCustomOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              size="sm"
              variant={activePresetLabel === null ? "default" : "outline"}
              className="gap-1.5 rounded-full"
            />
          }
        >
          <CalendarIcon className="size-3.5" />
          {activePresetLabel === null
            ? `${value.start} → ${value.end}`
            : "Custom"}
        </PopoverTrigger>
        <PopoverContent className="w-72 space-y-3 p-4" align="end">
          <div className="space-y-2">
            <Label htmlFor="range-start">Start date</Label>
            <Input
              id="range-start"
              type="date"
              value={draftStart}
              onChange={(e) => setDraftStart(e.target.value)}
              max={draftEnd}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="range-end">End date</Label>
            <Input
              id="range-end"
              type="date"
              value={draftEnd}
              onChange={(e) => setDraftEnd(e.target.value)}
              min={draftStart}
              max={toISODate(new Date())}
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={handleCustomApply}
            disabled={!draftStart || !draftEnd}
          >
            Apply
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}