import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AttributeRow = { key: string; value: string };

type AttributesBuilderProps = {
  attributes: Record<string, string>;
  onChange: (attributes: Record<string, string>) => void;
};

function toRows(attributes: Record<string, string>): AttributeRow[] {
  const entries = Object.entries(attributes);
  return entries.length > 0 ? entries.map(([key, value]) => ({ key, value })) : [{ key: "", value: "" }];
}

function toAttributes(rows: AttributeRow[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const row of rows) {
    if (row.key.trim()) {
      result[row.key.trim()] = row.value;
    }
  }
  return result;
}

export function AttributesBuilder({ attributes, onChange }: AttributesBuilderProps) {
  const rows = toRows(attributes);

  function updateRow(index: number, field: "key" | "value", value: string) {
    const next = [...rows];
    next[index] = { ...next[index], [field]: value };
    onChange(toAttributes(next));
  }

  function addRow() {
    onChange(toAttributes([...rows, { key: "", value: "" }]));
  }

  function removeRow(index: number) {
    const next = rows.filter((_, i) => i !== index);
    onChange(toAttributes(next.length > 0 ? next : [{ key: "", value: "" }]));
  }

  return (
    <div className="space-y-2">
      <Label>Details (optional)</Label>
      <p className="text-sm text-muted-foreground">
        Add extra details specific to this product, like color, size, or material.
      </p>

      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={row.key}
              onChange={(e) => updateRow(index, "key", e.target.value)}
              placeholder="e.g. Color"
              aria-label="Detail name"
              className="flex-1"
            />
            <Input
              value={row.value}
              onChange={(e) => updateRow(index, "value", e.target.value)}
              placeholder="e.g. Red"
              aria-label="Detail value"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRow(index)}
              aria-label="Remove detail"
              disabled={rows.length === 1 && !row.key && !row.value}
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1.5">
        <PlusIcon className="size-4" />
        Add detail
      </Button>
    </div>
  );
}