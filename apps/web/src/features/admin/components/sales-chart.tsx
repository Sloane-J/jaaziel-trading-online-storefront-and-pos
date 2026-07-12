import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSalesByCategory } from "@/features/admin/hooks/use-reports";
import { generateBrownShades } from "@/lib/brown-palette";
import { formatPrice } from "@/lib/format-price";

function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GH", { month: "short", day: "numeric" });
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-md">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{formatShortDate(label)}</p>
      <div className="space-y-1">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-foreground">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
              {entry.dataKey}
            </span>
            <span className="font-medium text-foreground">{formatPrice(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SalesChart() {
  const { data, isLoading, isError } = useSalesByCategory();

  if (isLoading) {
    return <div className="h-80 animate-pulse rounded-2xl bg-muted" />;
  }

  if (isError || !data) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl border border-border bg-card text-sm text-muted-foreground">
        Couldn't load sales data.
      </div>
    );
  }

  if (data.categories.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
        No sales yet in the last 15 days.
      </div>
    );
  }

  const colors = generateBrownShades(data.categories.length);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Sales by category — last 15 days
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data.days} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {data.categories.map((category, i) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[i]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}