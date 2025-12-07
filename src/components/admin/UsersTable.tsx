"use client";

import { useState, useMemo, useCallback } from "react";
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
import type { SortField, SortDirection } from "@/Types/userTableTypes";
import { formatDate } from "@/lib/utils/dateFormatter";
import { getSortIcon } from "@/lib/utils/tableSorting";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { SearchInput } from "@/components/product/filters/SearchInput";

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
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const isSuperAdmin = currentUser?.role === "superAdmin";

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...localUsers];

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query)
      );
    }

    if (sortField && sortDirection) {
      result.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        // Handle null values for lastLoginAt
        if (sortField === "lastLoginAt") {
          if (!aValue) return sortDirection === "asc" ? 1 : -1;
          if (!bValue) return sortDirection === "asc" ? -1 : 1;
        }

        // Convert dates to timestamps for comparison
        if (sortField === "createdAt" || sortField === "lastLoginAt") {
          const aTime = new Date(aValue as string).getTime();
          const bTime = new Date(bValue as string).getTime();
          return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
        }

        if (sortField === "email" || sortField === "role") {
          const aStr = aValue as string;
          const bStr = bValue as string;
          return sortDirection === "asc"
            ? aStr.localeCompare(bStr)
            : bStr.localeCompare(aStr);
        }

        if (sortField === "orderCount") {
          const aNum = aValue as number;
          const bNum = bValue as number;
          return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
        }

        return 0;
      });
    }

    return result;
  }, [localUsers, searchQuery, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        // Toggle direction or reset
        if (sortDirection === "asc") {
          setSortDirection("desc");
        } else if (sortDirection === "desc") {
          setSortField(null);
          setSortDirection(null);
        }
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
      setCurrentPage(1);
    },
    [sortField, sortDirection]
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

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

    setLoading(true);
    const updates = Array.from(roleChanges.entries()).map(([userId, role]) => ({
      userId,
      role: role as "customer" | "admin" | "superAdmin",
    }));

    const result = await batchUpdateUserRoles(updates);

    if (result.success) {
      setRoleChanges(new Map());
      router.refresh();
    } else {
      // Revert local changes on error
      setLocalUsers(users);
      alert(result.error || "Failed to update roles");
    }

    setLoading(false);
  };

  const openDeleteDialog = (userId: string, userEmail: string) => {
    setUserToDelete({ id: userId, email: userEmail });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setLoading(true);
    const result = await deleteUser(userToDelete.id);

    if (result.success) {
      setLocalUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      router.refresh();
    } else {
      alert(result.error || "Failed to delete user");
    }

    setLoading(false);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleExportCSV = () => {
    const headers = ["Email", "Joined", "Last Login", "Orders", "Role"];
    const csvContent = [
      headers.join(","),
      ...localUsers.map((user) =>
        [
          `"${user.email}"`,
          `"${formatDate(user.createdAt)}"`,
          `"${formatDate(user.lastLoginAt)}"`,
          user.orderCount,
          user.role,
        ].join(",")
      ),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `users_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <div className="w-full sm:w-96">
            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
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

        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedUsers.length} of {localUsers.length} users
          </p>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="text-xs sm:text-sm cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("email")}
                >
                  Email{getSortIcon(sortField, "email", sortDirection)}
                </TableHead>
                <TableHead
                  className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("createdAt")}
                >
                  Joined{getSortIcon(sortField, "createdAt", sortDirection)}
                </TableHead>
                <TableHead
                  className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("lastLoginAt")}
                >
                  Last Login{getSortIcon(sortField, "lastLoginAt", sortDirection)}
                </TableHead>
                <TableHead
                  className="text-xs sm:text-sm cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("orderCount")}
                >
                  Orders{getSortIcon(sortField, "orderCount", sortDirection)}
                </TableHead>
                <TableHead
                  className="text-xs sm:text-sm cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("role")}
                >
                  Role{getSortIcon(sortField, "role", sortDirection)}
                </TableHead>
                {isSuperAdmin && (
                  <TableHead className="hidden md:table-cell">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
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
                      disabled={loading}
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
                      disabled={loading}
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
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(user.id, user.email)}
                        disabled={loading || user.id === currentUser?.id}
                        className="h-9 text-xs rounded-none"
                      >
                        DELETE
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <Pagination className="justify-center mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-sm text-muted-foreground px-4">
                  Page {currentPage} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className={
                    currentPage === totalPages
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
            <Button
              onClick={handleSaveChanges}
              disabled={loading}
              className="rounded-none text-xs"
            >
              {loading ? "SAVING..." : `SAVE CHANGES (${roleChanges.size})`}
            </Button>
          </div>
        )}
      </div>

      <OrdersDialog
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-none">
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
              disabled={loading}
              variant="outline"
              className="rounded-none"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={loading}
              variant="destructive"
              className="rounded-none"
            >
              {loading ? "DELETING" : "DELETE"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
