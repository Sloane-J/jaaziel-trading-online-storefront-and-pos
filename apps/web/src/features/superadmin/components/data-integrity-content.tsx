import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClockIcon,
  DatabaseIcon,
  PackageXIcon,
  ShoppingCartIcon,
  XCircleIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDataIntegrityReport } from "@/features/superadmin/hooks/use-data-integrity";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof DatabaseIcon;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export function DataIntegrityContent() {
  const { data, isLoading, isError, error } = useDataIntegrityReport();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Couldn't load data integrity report:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </p>
    );
  }

  const hasIssues =
    data.orphanedRecords.orderItemsWithMissingProduct > 0 ||
    data.inventoryIssues.negativeStock.length > 0 ||
    !data.schemaDrift.healthy;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading">Data Integrity</h2>
        <p className="text-sm text-muted-foreground">
          Table health, orphaned records, and schema checks for this tenant.
        </p>
      </div>

      <div
        className={`flex items-center gap-2 rounded-xl border p-4 text-sm ${
          hasIssues
            ? "border-destructive/40 bg-destructive/5 text-destructive"
            : "border-success/40 bg-success/5 text-success"
        }`}
      >
        {hasIssues ? (
          <AlertTriangleIcon className="size-4 shrink-0" />
        ) : (
          <CheckCircle2Icon className="size-4 shrink-0" />
        )}
        {hasIssues
          ? "Some issues were found below — review before they compound."
          : "No issues found. Everything checked out clean."}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Table counts
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatBlock icon={DatabaseIcon} label="Orders" value={data.tableCounts.orders} />
          <StatBlock icon={DatabaseIcon} label="Products" value={data.tableCounts.products} />
          <StatBlock icon={DatabaseIcon} label="Categories" value={data.tableCounts.categories} />
          <StatBlock icon={DatabaseIcon} label="Users" value={data.tableCounts.users} />
          <StatBlock icon={DatabaseIcon} label="Activity logs" value={data.tableCounts.activityLogs} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center gap-1.5">
            <PackageXIcon className="size-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Orphaned order items</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {data.orphanedRecords.orderItemsWithMissingProduct}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Order items pointing to a product that no longer exists.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center gap-1.5">
            <ShoppingCartIcon className="size-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Stale guest carts</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {data.staleGuestCarts.count}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            No customer attached, untouched for {data.staleGuestCarts.olderThanDays}+ days.
          </p>
        </div>
      </div>

      {data.inventoryIssues.negativeStock.length > 0 && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
          <p className="mb-2 text-sm font-semibold text-destructive">
            Products with negative stock
          </p>
          <ul className="space-y-1 text-sm text-foreground">
            {data.inventoryIssues.negativeStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span>{p.name}</span>
                <Badge variant="destructive">{p.stock}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-2 text-sm font-semibold text-foreground">
          Schema check ({data.schemaDrift.checked} columns verified)
        </p>
        {data.schemaDrift.healthy ? (
          <p className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2Icon className="size-4" />
            All expected columns are present.
          </p>
        ) : (
          <div className="space-y-1">
            <p className="flex items-center gap-2 text-sm text-destructive">
              <XCircleIcon className="size-4" />
              Missing columns detected:
            </p>
            <ul className="pl-6 text-sm text-destructive">
              {data.schemaDrift.missing.map((m) => (
                <li key={`${m.table}.${m.column}`}>
                  <code>{m.table}.{m.column}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-1.5">
          <ClockIcon className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">
            Latest cleanup job run
          </p>
        </div>
        {data.latestCronRun ? (
          <div className="text-sm">
            <p className="text-foreground">
              {formatTimestamp(data.latestCronRun.ranAt)} ·{" "}
              {data.latestCronRun.success ? (
                <span className="text-success">Success</span>
              ) : (
                <span className="text-destructive">Failed</span>
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {data.latestCronRun.rowsAffected} activity log rows delappeted.
              {data.latestCronRun.errorMessage && (
                <span className="text-destructive">
                  {" "}
                  Error: {data.latestCronRun.errorMessage}
                </span>
              )}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No runs recorded yet — the cleanup job runs daily at midnight UTC.
          </p>
        )}
      </div>
    </div>
  );
}