import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  BanIcon,
  CheckCircle2Icon,
  SearchIcon,
  UserPlusIcon,
} from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StaffFormDialog } from "@/features/admin/components/staff-form-dialog";
import { useStaff, useUpdateStaff } from "@/features/admin/hooks/use-staff";
import type { StaffMember, StaffRole } from "@/lib/api/staff";

type SortKey = "name" | "role";
type SortDirection = "asc" | "desc";

const ASSIGNABLE_ROLES: StaffRole[] = ["admin", "cashier", "staff"];

function SortableHeader({
  label,
  sortKey,
  currentSort,
  currentDirection,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey | null;
  currentDirection: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  const isActive = currentSort === sortKey;
  const Icon = isActive
    ? currentDirection === "asc"
      ? ArrowUpIcon
      : ArrowDownIcon
    : ArrowUpDownIcon;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 text-left font-medium transition-colors hover:text-foreground ${
        isActive ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      {label}
      <Icon className="size-3.5" aria-hidden="true" />
    </button>
  );
}

export function StaffTable() {
  const { data: staff, isLoading, isError, error } = useStaff();
  const updateStaffMember = useUpdateStaff();

  const [formOpen, setFormOpen] = useState(false);
  const [deactivatingStaff, setDeactivatingStaff] =
    useState<StaffMember | null>(null);

  const [pendingRoleChange, setPendingRoleChange] = useState<{
    staff: StaffMember;
    newRole: StaffRole;
  } | null>(null);

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  const filteredStaff = (() => {
    if (!staff) return staff;
    if (!searchQuery.trim()) return staff;

    const q = searchQuery.trim().toLowerCase();
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
    );
  })();

  const sortedStaff = (() => {
    if (!filteredStaff) return filteredStaff;
    if (!sortKey) return filteredStaff;

    const sorted = [...filteredStaff].sort((a, b) => {
      let comparison = 0;
      if (sortKey === "name") comparison = a.name.localeCompare(b.name);
      if (sortKey === "role")
        comparison = (a.role ?? "").localeCompare(b.role ?? "");
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  })();

  function handleRoleSelect(staffMember: StaffMember, value: string | null) {
    const role = (value ?? "") as StaffRole;
    if (!ASSIGNABLE_ROLES.includes(role)) return;
    if (role === staffMember.role) return;
    setPendingRoleChange({ staff: staffMember, newRole: role });
  }
  
  async function confirmRoleChange() {
    if (!pendingRoleChange) return;
    await updateStaffMember.mutateAsync({
      id: pendingRoleChange.staff.id,
      input: { role: pendingRoleChange.newRole },
    });
    setPendingRoleChange(null);
  }

  async function confirmDeactivate() {
    if (!deactivatingStaff) return;
    await updateStaffMember.mutateAsync({
      id: deactivatingStaff.id,
      input: { isActive: false },
    });
    setDeactivatingStaff(null);
  }

  async function handleReactivate(staffMember: StaffMember) {
    await updateStaffMember.mutateAsync({
      id: staffMember.id,
      input: { isActive: true },
    });
  }

  if (isLoading) {
    return <p className="text-muted-foreground">Loading staff…</p>;
  }

  if (isError) {
    return (
      <p role="alert" className="text-destructive">
        Couldn't load staff:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-heading">Staff</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:w-64"
              aria-label="Search staff"
            />
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <UserPlusIcon className="size-4" />
            Add staff
          </Button>
        </div>
      </div>

      {sortedStaff && sortedStaff.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            {searchQuery ? "No staff match your search." : "No staff yet."}
          </p>
          {!searchQuery && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setFormOpen(true)}
            >
              Add your first staff member
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortableHeader
                  label="Name"
                  sortKey="name"
                  currentSort={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>
                <SortableHeader
                  label="Role"
                  sortKey="role"
                  currentSort={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStaff?.map((staffMember) => {
              const isSuperadmin = staffMember.role === "superadmin";

              return (
                <TableRow key={staffMember.id}>
                  <TableCell className="font-medium">
                    {staffMember.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {staffMember.email}
                  </TableCell>
                  <TableCell>
                    {isSuperadmin ? (
                      <Badge variant="secondary">Superadmin</Badge>
                    ) : (
                      <Select
                        value={staffMember.role ?? ""}
                        onValueChange={(value) => handleRoleSelect(staffMember, value)}
                      >
                        <SelectTrigger className="h-8 w-32 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSIGNABLE_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        staffMember.isActive
                          ? "bg-success text-success-foreground"
                          : ""
                      }
                      variant={staffMember.isActive ? "default" : "secondary"}
                    >
                      {staffMember.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {isSuperadmin ? null : staffMember.isActive ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Deactivate ${staffMember.name}`}
                        onClick={() => setDeactivatingStaff(staffMember)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <BanIcon className="size-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Reactivate ${staffMember.name}`}
                        onClick={() => handleReactivate(staffMember)}
                        className="text-success hover:bg-success/10 hover:text-success"
                      >
                        <CheckCircle2Icon className="size-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <StaffFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <AlertDialog
        open={Boolean(deactivatingStaff)}
        onOpenChange={(open) => !open && setDeactivatingStaff(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate this staff member?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deactivatingStaff?.name}" will no longer be able to log in.
              You can reactivate them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(pendingRoleChange)}
        onOpenChange={(open) => !open && setPendingRoleChange(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change role?</AlertDialogTitle>
            <AlertDialogDescription>
              Change {pendingRoleChange?.staff.name}'s role from{" "}
              <strong>{pendingRoleChange?.staff.role}</strong> to{" "}
              <strong>{pendingRoleChange?.newRole}</strong>? This changes
              what they can access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}