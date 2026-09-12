import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActivityLogs } from "@/features/admin/hooks/use-activity-logs";

const ACTION_LABELS: Record<string, string> = {
  "staff.created": "Staff created",
  "staff.role_changed": "Role changed",
  "staff.activated": "Staff activated",
  "staff.deactivated": "Staff deactivated",
  "order.status_changed": "Order status changed",
  "pos.sale_created": "POS sale",
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ActivityLogTable() {
  const { data: logs, isLoading, isError, error } = useActivityLogs();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = (() => {
    if (!logs) return logs;
    if (!searchQuery.trim()) return logs;

    const q = searchQuery.trim().toLowerCase();
    return logs.filter(
      (log) =>
        log.actorName.toLowerCase().includes(q) ||
        (log.details ?? "").toLowerCase().includes(q),
    );
  })();

  if (isLoading) {
    return <p className="text-muted-foreground">Loading activity…</p>;
  }

  if (isError) {
    return (
      <p role="alert" className="text-destructive">
        Couldn't load activity log:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-heading">Activity Log</h2>
          <p className="text-sm text-muted-foreground">
            Staff and order changes from the last 90 days.
          </p>
        </div>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:w-64"
            aria-label="Search activity log"
          />
        </div>
      </div>

      {filteredLogs && filteredLogs.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            {searchQuery
              ? "No activity matches your search."
              : "No activity recorded yet."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Who</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatTimestamp(log.createdAt)}
                </TableCell>
                <TableCell className="font-medium">{log.actorName}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {log.details ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}