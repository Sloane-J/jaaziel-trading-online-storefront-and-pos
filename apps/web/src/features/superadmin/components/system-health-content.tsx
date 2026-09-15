import {
  ActivityIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClockIcon,
  DatabaseIcon,
  XCircleIcon,
} from "lucide-react";
import { useSystemHealth } from "@/features/superadmin/hooks/use-system-health";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatusPill({ healthy, label }: { healthy: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
        healthy
          ? "bg-success/10 text-success"
          : "bg-destructive/10 text-destructive"
      }`}
    >
      {healthy ? (
        <CheckCircle2Icon className="size-4" />
      ) : (
        <XCircleIcon className="size-4" />
      )}
      {label}
    </span>
  );
}

export function SystemHealthContent() {
  const { data, isLoading, isError, error } = useSystemHealth();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Couldn't load system health:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading">System Health</h2>
        <p className="text-sm text-muted-foreground">
          Database connectivity and scheduled job status. Refreshes automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-1.5">
            <DatabaseIcon className="size-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Database</p>
          </div>

          <StatusPill
            healthy={data.database.healthy}
            label={data.database.healthy ? "Connected" : "Connection failed"}
          />

          <p className="text-xs text-muted-foreground">
            Responded in {data.database.latencyMs}ms
          </p>

          {data.database.error && (
            <p className="rounded-lg bg-destructive/5 p-2 text-xs text-destructive">
              {data.database.error}
            </p>
          )}
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-1.5">
            <ClockIcon className="size-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">
              Activity log cleanup (daily cron)
            </p>
          </div>

          <StatusPill
            healthy={data.cron.isOnSchedule}
            label={data.cron.isOnSchedule ? "On schedule" : "Overdue or missing"}
          />

          {data.cron.latestRun ? (
            <div className="text-xs text-muted-foreground">
              <p>Last ran {formatTimestamp(data.cron.latestRun.ranAt)}</p>
              <p>
                {data.cron.latestRun.rowsAffected} rows deleted ·{" "}
                {data.cron.latestRun.success ? (
                  <span className="text-success">succeeded</span>
                ) : (
                  <span className="text-destructive">failed</span>
                )}
              </p>
              {data.cron.latestRun.errorMessage && (
                <p className="mt-1 rounded-lg bg-destructive/5 p-2 text-destructive">
                  {data.cron.latestRun.errorMessage}
                </p>
              )}
            </div>
          ) : (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <AlertTriangleIcon className="size-3.5" />
              No runs recorded yet.
            </p>
          )}
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ActivityIcon className="size-3.5" />
        Last checked {formatTimestamp(data.checkedAt)}
      </p>
    </div>
  );
}