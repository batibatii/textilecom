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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { updateOrderStatus } from "@/app/actions/admin/orders/updateOrderStatus";
import { OrderDetailDialog } from "./OrderDetailDialog";
import type { OrderTableData } from "@/Types/orderTableTypes";
import type { SortField, SortDirection } from "@/Types/orderTableTypes";
import { formatDate } from "@/lib/utils/dateFormatter";
import { getCurrencySymbol } from "@/lib/utils/productPrice";
import { getSortIcon } from "@/lib/utils/tableSorting";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { SearchInput } from "@/components/product/filters/SearchInput";

interface OrdersTableProps {
  orders: OrderTableData[];
}

const ITEMS_PER_PAGE = 10;

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter();
  const [localOrders, setLocalOrders] = useState(orders);
  const [statusChanges, setStatusChanges] = useState<Map<string, string>>(
    new Map()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...localOrders];

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.customerEmail.toLowerCase().includes(query)
      );
    }

    if (sortField && sortDirection) {
      result.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (sortField === "createdAt") {
          const aTime = new Date(aValue as string).getTime();
          const bTime = new Date(bValue as string).getTime();
          return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
        }

        if (
          sortField === "orderNumber" ||
          sortField === "customerEmail" ||
          sortField === "status"
        ) {
          const aStr = aValue as string;
          const bStr = bValue as string;
          return sortDirection === "asc"
            ? aStr.localeCompare(bStr)
            : bStr.localeCompare(aStr);
        }

        if (sortField === "total") {
          const aNum = aValue as number;
          const bNum = bValue as number;
          return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
        }

        return 0;
      });
    }

    return result;
  }, [localOrders, searchQuery, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOrders = filteredAndSortedOrders.slice(startIndex, endIndex);

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

  const handleStatusChange = (orderId: string, newStatus: string) => {
    const newChanges = new Map(statusChanges);
    const originalStatus = orders.find((o) => o.id === orderId)?.status;

    if (newStatus === originalStatus) {
      newChanges.delete(orderId);
    } else {
      newChanges.set(orderId, newStatus);
    }

    setStatusChanges(newChanges);

    // Update local state for immediate UI feedback
    setLocalOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: newStatus as OrderTableData["status"] }
          : o
      )
    );
  };

  const handleApplyChanges = async () => {
    if (statusChanges.size === 0) return;

    setLoading(true);
    setError(undefined);
    setSuccess(false);

    // Process each status change
    const updates = Array.from(statusChanges.entries());
    const results = await Promise.all(
      updates.map(([orderId, status]) => updateOrderStatus(orderId, status))
    );

    const allSucceeded = results.every((result) => result.success);

    if (allSucceeded) {
      setStatusChanges(new Map());
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } else {
      // Revert local changes on error
      setLocalOrders(orders);
      const failedUpdate = results.find((r) => !r.success);
      setError(failedUpdate?.error || "Failed to update order statuses");
    }

    setLoading(false);
  };

  const handleExportCSV = () => {
    const headers = [
      "Order Number",
      "Order Date",
      "Customer Email",
      "Status",
      "Total",
      "Currency",
    ];
    const csvContent = [
      headers.join(","),
      ...localOrders.map((order) =>
        [
          `"${order.orderNumber}"`,
          `"${formatDate(order.createdAt)}"`,
          `"${order.customerEmail}"`,
          order.status,
          order.total,
          order.currency,
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
      `orders_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <div className="w-full sm:w-96">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by order number or customer email..."
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
          Showing {filteredAndSortedOrders.length} of {localOrders.length}{" "}
          orders
        </p>
      )}

      {success && (
        <Alert className="mt-2">
          <AlertTitle className="text-sm">
            Order statuses updated successfully!
          </AlertTitle>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertTitle className="text-sm">{error}</AlertTitle>
        </Alert>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="text-xs sm:text-sm cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("orderNumber")}
              >
                Order No{getSortIcon(sortField, "orderNumber", sortDirection)}
              </TableHead>
              <TableHead
                className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("createdAt")}
              >
                Order Date{getSortIcon(sortField, "createdAt", sortDirection)}
              </TableHead>
              <TableHead
                className="text-xs sm:text-sm cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("customerEmail")}
              >
                Customer Email
                {getSortIcon(sortField, "customerEmail", sortDirection)}
              </TableHead>
              <TableHead
                className="text-xs sm:text-sm cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("status")}
              >
                Order Status{getSortIcon(sortField, "status", sortDirection)}
              </TableHead>
              <TableHead
                className="text-xs sm:text-sm cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("total")}
              >
                Total{getSortIcon(sortField, "total", sortDirection)}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium text-xs sm:text-sm">
                  <button
                    onClick={() => setSelectedOrderId(order.id)}
                    className="text-primary hover:underline cursor-pointer"
                    disabled={loading}
                  >
                    {order.orderNumber}
                  </button>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="text-xs sm:text-sm">
                  {order.customerEmail}
                </TableCell>
                <TableCell>
                  <NativeSelect
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    disabled={loading}
                    className="w-[110px] sm:w-[140px] h-8 sm:h-9 text-xs sm:text-sm rounded-none"
                  >
                    <NativeSelectOption value="processing">
                      Processing
                    </NativeSelectOption>
                    <NativeSelectOption value="completed">
                      Completed
                    </NativeSelectOption>
                  </NativeSelect>
                </TableCell>
                <TableCell className="text-xs sm:text-sm">
                  {getCurrencySymbol(order.currency)}
                  {order.total.toFixed(2)}
                </TableCell>
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
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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

      {statusChanges.size > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleApplyChanges}
            disabled={loading}
            className="rounded-none text-xs"
          >
            {loading ? "APPLYING..." : `APPLY CHANGES (${statusChanges.size})`}
          </Button>
        </div>
      )}

      <OrderDetailDialog
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
