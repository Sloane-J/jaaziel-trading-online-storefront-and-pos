import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
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
import { useReturns } from "@/features/admin/hooks/use-admin-returns";
import type { ReturnStatus } from "@/lib/api/admin-returns";

const STATUS_LABELS: Record<ReturnStatus, string> = {
  requested: "Requested",
  item_received: "Item received",
  approved: "Approved",
  rejected: "Rejected",
  refunded: "Refunded",
};

function StatusBadge({ status }: { status: ReturnStatus }) {
  const variant =
    status === "refunded"
      ? "default"
      : status === "rejected"
        ? "destructive"
        : "secondary";

  return <Badge variant={variant}>{STATUS_LABELS[status]}</Badge>;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ReturnsTable() {
  const { data: returnsList, isLoading, isError, error } = useReturns();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = (() => {
    if (!returnsList) return returnsList;
    if (!searchQuery.trim()) return returnsList;
    const q = searchQuery.trim().toLowerCase();
    return returnsList.filter(
      (r) => r.id.toLowerCase().includes(q) || r.orderId.toLowerCase().includes(q),
    );
  })();

  if (isLoading) {
    return <p className="text-muted-foreground">Loading returns…</p>;
  }

  if (isError) {
    return (
      <p role="alert" className="text-destructive">
        Couldn't load returns:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-heading">Returns</h2>
          <p className="text-sm text-muted-foreground">
            Customer and admin-initiated return requests.
          </p>
        </div>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:w-64"
            aria-label="Search returns"
          />
        </div>
      </div>

      {filtered && filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            {searchQuery ? "No returns match your search." : "No return requests yet."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requested</TableHead>
              <TableHead>Requested by</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Refund amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {formatTimestamp(r.createdAt)}
                </TableCell>
                <TableCell className="capitalize">{r.requestedBy}</TableCell>
                <TableCell>
                  {r.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                </TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell>
                  {r.refundAmount ? `GHS ${Number(r.refundAmount).toFixed(2)}` : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    to={`/admin/returns/${r.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Review
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}