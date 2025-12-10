"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { OrdersDialog } from "./OrdersDialog";
import { batchUpdateUserRoles } from "@/app/actions/admin/users/updateRoles";
import { deleteUser } from "@/app/actions/admin/users/deleteUser";
import { useAuth } from "@/contexts/AuthContext";
import type { UserDashboardData } from "@/Types/userDashboardType";
import type { SortField } from "@/Types/userTableTypes";
import { formatDate } from "@/lib/utils/dateFormatter";
import { getSortIcon } from "@/lib/utils/tableSorting";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { SearchInput } from "@/components/product/filters/SearchInput";
import { LoadingButton } from "@/components/ui/loading-button";
import { useTableState } from "@/hooks/useTableState";
import { useDialogState } from "@/hooks/useDialogState";
import { useAsyncData } from "@/hooks/useAsyncData";
import { exportToCSV } from "@/lib/utils/csvExport";

interface UsersTableProps {
  users: UserDashboardData[];
}

const ITEMS_PER_PAGE = 10;

export function UsersTable({ users }: UsersTableProps) {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [localUsers, setLocalUsers] = useState(users);
  const [roleChanges, setRoleChanges] = useState<Map<string, string>>(
    new Map()
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    email: string;
  } | null>(null);

  const saveOperation = useAsyncData();
  const deleteOperation = useAsyncData();
  const deleteDialog = useDialogState();

  const isSuperAdmin = currentUser?.role === "superAdmin";

  const table = useTableState<UserDashboardData, SortField>({
    data: localUsers,
    itemsPerPage: ITEMS_PER_PAGE,
    searchFields: ["email", "role"],
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    const newChanges = new Map(roleChanges);
    const originalRole = users.find((u) => u.id === userId)?.role;

    if (newRole === originalRole) {
      newChanges.delete(userId);
    } else {
      newChanges.set(userId, newRole);
    }

    setRoleChanges(newChanges);

    // Update local state for immediate UI feedback
    setLocalUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, role: newRole as UserDashboardData["role"] }
          : u
      )
    );
  };

  const handleSaveChanges = async () => {
    if (roleChanges.size === 0) return;

    await saveOperation.execute(async () => {
      const updates = Array.from(roleChanges.entries()).map(
        ([userId, role]) => ({
          userId,
          role: role as "customer" | "admin" | "superAdmin",
        })
      );

      const result = await batchUpdateUserRoles(updates);

      if (result.success) {
        setRoleChanges(new Map());
        router.refresh();
      } else {
        // Revert local changes on error
        setLocalUsers(users);
        throw new Error(result.error || "Failed to update roles");
      }
    });
  };

  const openDeleteDialog = (userId: string, userEmail: string) => {
    setUserToDelete({ id: userId, email: userEmail });
    deleteDialog.openDialog();
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    await deleteOperation.execute(async () => {
      const result = await deleteUser(userToDelete.id);

      if (result.success) {
        setLocalUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        deleteDialog.closeDialog();
        setUserToDelete(null);
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to delete user");
      }
    });
  };

  const handleDeleteCancel = () => {
    deleteDialog.closeDialog();
    setUserToDelete(null);
  };

  const handleExportCSV = () => {
    exportToCSV(
      localUsers,
      ["Email", "Joined", "Last Login", "Orders", "Role"],
      "users",
      (user) => [
        user.email,
        formatDate(user.createdAt),
        formatDate(user.lastLoginAt),
        user.orderCount,
        user.role,
      ]
    );
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <div className="w-full sm:w-96">
            <SearchInput
              value={table.searchQuery}
              onChange={table.handleSearchChange}
              placeholder="Search by email or role..."
            />
          </div>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="rounded-none gap-2 text-xs w-full sm:w-auto"
          >
            <Download className="h-4 w-4" />
            EXPORT CSV
          </Button>
        </div>

        {table.searchQuery && (
          <p className="text-sm text-muted-foreground">
            Showing {table.filteredData.length} of {localUsers.length} users
          </p>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="text-xs sm:text-sm cursor-pointer hover:bg-muted/50"
                  onClick={() => table.handleSort("email")}
                >
                  Email
                  {getSortIcon(table.sortField, "email", table.sortDirection)}
                </TableHead>
                <TableHead
                  className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                  onClick={() => table.handleSort("createdAt")}
                >
                  Joined
                  {getSortIcon(
                    table.sortField,
                    "createdAt",
                    table.sortDirection
                  )}
                </TableHead>
                <TableHead
                  className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                  onClick={() => table.handleSort("lastLoginAt")}
                >
                  Last Login
                  {getSortIcon(
                    table.sortField,
                    "lastLoginAt",
                    table.sortDirection
                  )}
                </TableHead>
                <TableHead
                  className="text-xs sm:text-sm cursor-pointer hover:bg-muted/50"
                  onClick={() => table.handleSort("orderCount")}
                >
                  Orders
                  {getSortIcon(
                    table.sortField,
                    "orderCount",
                    table.sortDirection
                  )}
                </TableHead>
                <TableHead
                  className="text-xs sm:text-sm cursor-pointer hover:bg-muted/50"
                  onClick={() => table.handleSort("role")}
                >
                  Role
                  {getSortIcon(table.sortField, "role", table.sortDirection)}
                </TableHead>
                {isSuperAdmin && (
                  <TableHead className="hidden md:table-cell">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.paginatedData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-xs sm:text-sm">
                    {user.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {formatDate(user.lastLoginAt)}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setSelectedUserId(user.id)}
                      className="text-primary hover:underline text-xs sm:text-sm cursor-pointer"
                      disabled={
                        saveOperation.loading || deleteOperation.loading
                      }
                    >
                      {user.orderCount}
                    </button>
                  </TableCell>
                  <TableCell>
                    <NativeSelect
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      disabled={
                        saveOperation.loading || deleteOperation.loading
                      }
                      className="w-[110px] sm:w-[140px] h-8 sm:h-9 text-xs sm:text-sm rounded-none"
                    >
                      <NativeSelectOption value="customer">
                        Customer
                      </NativeSelectOption>
                      <NativeSelectOption value="admin">
                        Admin
                      </NativeSelectOption>
                      <NativeSelectOption value="superAdmin">
                        Super Admin
                      </NativeSelectOption>
                    </NativeSelect>
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell className="hidden md:table-cell">
                      <LoadingButton
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(user.id, user.email)}
                        disabled={
                          saveOperation.loading ||
                          deleteOperation.loading ||
                          user.id === currentUser?.id
                        }
                        className="h-9 text-xs rounded-none"
                      >
                        DELETE
                      </LoadingButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {table.totalPages > 1 && (
          <Pagination className="justify-center mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    table.setCurrentPage(Math.max(1, table.currentPage - 1))
                  }
                  className={
                    table.currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-sm text-muted-foreground px-4">
                  Page {table.currentPage} of {table.totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    table.setCurrentPage(
                      Math.min(table.totalPages, table.currentPage + 1)
                    )
                  }
                  className={
                    table.currentPage === table.totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {roleChanges.size > 0 && (
          <div className="flex justify-end">
            <LoadingButton
              onClick={handleSaveChanges}
              loading={saveOperation.loading}
              loadingText="SAVING..."
              className="rounded-none text-xs"
            >
              SAVE CHANGES ({roleChanges.size})
            </LoadingButton>
          </div>
        )}
      </div>

      <OrdersDialog
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />

      <Dialog open={deleteDialog.open} onOpenChange={deleteDialog.setOpen}>
        <DialogContent className="rounded-none p-6">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user{" "}
              <span className="font-semibold">
                &quot;{userToDelete?.email}&quot;
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-4 mt-4">
            <Button
              onClick={handleDeleteCancel}
              disabled={deleteOperation.loading}
              variant="outline"
              className="rounded-none"
            >
              CANCEL
            </Button>
            <LoadingButton
              onClick={handleDeleteConfirm}
              loading={deleteOperation.loading}
              loadingText="DELETING"
              variant="destructive"
              className="rounded-none"
            >
              DELETE
            </LoadingButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
