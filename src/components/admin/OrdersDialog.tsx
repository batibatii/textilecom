"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrdersForUser } from "@/app/actions/admin/users/getUserOrders";
import type { Order } from "@/Types/orderValidation";
import { formatDate } from "@/lib/utils/dateFormatter";
import { getCurrencySymbol } from "@/lib/utils/productPrice";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface OrdersDialogProps {
  userId: string | null;
  onClose: () => void;
}

export function OrdersDialog({ userId, onClose }: OrdersDialogProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const handleExportCSV = () => {
    if (orders.length === 0) return;

    const headers = ["Order Number", "Date", "Status", "Total", "Currency"];
    const csvContent = [
      headers.join(","),
      ...orders.map((order) =>
        [
          `"${order.orderNumber}"`,
          `"${formatDate(order.createdAt)}"`,
          order.status,
          order.totals.total.toFixed(2),
          order.totals.currency,
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

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    getOrdersForUser(userId)
      .then((result) => {
        if (result.success && result.orders) {
          setOrders(result.orders);
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <Dialog open={!!userId} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl rounded-none p-10">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>User Orders</DialogTitle>
            {orders.length > 0 && (
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="rounded-none gap-2 text-xs"
              >
                <Download className="h-4 w-4" />
                EXPORT CSV
              </Button>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8 text-sm text-muted-foreground">
            Loading...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No orders found
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-sm">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="capitalize text-sm">
                      {order.status}
                    </TableCell>
                    <TableCell className="text-sm">
                      {getCurrencySymbol(order.totals.currency)}
                      {order.totals.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
