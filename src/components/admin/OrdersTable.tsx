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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { updateOrderStatus } from "@/app/actions/admin/orders/updateOrderStatus";
import { ErrorAlert } from "@/components/alert/ErrorAlert";
import { SuccessAlert } from "@/components/alert/SuccessAlert";
import { LoadingButton } from "@/components/ui/loading-button";
import { useTableState } from "@/hooks/useTableState";
import { useAsyncData } from "@/hooks/useAsyncData";
import { OrderDetailDialog } from "./OrderDetailDialog";
import type { OrderTableData } from "@/Types/orderTableTypes";
import type { SortField } from "@/Types/orderTableTypes";
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
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const updateOperation = useAsyncData();

  const table = useTableState<OrderTableData, SortField>({
    data: localOrders,
    itemsPerPage: ITEMS_PER_PAGE,
    searchFields: ["orderNumber", "customerEmail"],
  });

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

    await updateOperation.execute(async () => {
      // Process each status change
      const updates = Array.from(statusChanges.entries());
      const results = await Promise.all(
        updates.map(([orderId, status]) => updateOrderStatus(orderId, status))
      );

      const allSucceeded = results.every((result) => result.success);

      if (allSucceeded) {
        setStatusChanges(new Map());
        router.refresh();
      } else {
        // Revert local changes on error
        setLocalOrders(orders);
        const failedUpdate = results.find((r) => !r.success);
        throw new Error(
          failedUpdate?.error || "Failed to update order statuses"
        );
      }
    });

    if (updateOperation.success) {
      setTimeout(() => updateOperation.setSuccess(false), 3000);
    }
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
            value={table.searchQuery}
            onChange={table.handleSearchChange}
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

      {table.searchQuery && (
        <p className="text-sm text-muted-foreground">
          Showing {table.filteredData.length} of {localOrders.length} orders
        </p>
      )}

      <SuccessAlert
        message={
          updateOperation.success
            ? "Order statuses updated successfully!"
            : undefined
        }
        className="mt-2"
      />

      <ErrorAlert message={updateOperation.error} className="mt-2" />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="text-xs sm:text-sm cursor-pointer hover:bg-muted/50"
                onClick={() => table.handleSort("orderNumber")}
              >
                Order No
                {getSortIcon(
                  table.sortField,
                  "orderNumber",
                  table.sortDirection
                )}
              </TableHead>
              <TableHead
                className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                onClick={() => table.handleSort("createdAt")}
              >
                Order Date
                {getSortIcon(table.sortField, "createdAt", table.sortDirection)}
              </TableHead>
              <TableHead
                className="text-xs sm:text-sm cursor-pointer hover:bg-muted/50"
                onClick={() => table.handleSort("customerEmail")}
              >
                Customer Email
                {getSortIcon(
                  table.sortField,
                  "customerEmail",
                  table.sortDirection
                )}
              </TableHead>
              <TableHead
                className="text-xs sm:text-sm cursor-pointer hover:bg-muted/50"
                onClick={() => table.handleSort("status")}
              >
                Order Status
                {getSortIcon(table.sortField, "status", table.sortDirection)}
              </TableHead>
              <TableHead
                className="text-xs sm:text-sm cursor-pointer hover:bg-muted/50"
                onClick={() => table.handleSort("total")}
              >
                Total
                {getSortIcon(table.sortField, "total", table.sortDirection)}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.paginatedData.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium text-xs sm:text-sm">
                  <button
                    onClick={() => setSelectedOrderId(order.id)}
                    className="text-primary hover:underline cursor-pointer"
                    disabled={updateOperation.loading}
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
                    disabled={updateOperation.loading}
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

      {statusChanges.size > 0 && (
        <div className="flex justify-end">
          <LoadingButton
            onClick={handleApplyChanges}
            loading={updateOperation.loading}
            loadingText="APPLYING..."
            className="rounded-none text-xs"
          >
            APPLY CHANGES ({statusChanges.size})
          </LoadingButton>
        </div>
      )}

      <OrderDetailDialog
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
