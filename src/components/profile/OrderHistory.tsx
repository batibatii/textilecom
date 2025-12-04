"use client";

import { useState, useEffect } from "react";
import { Order } from "@/Types/orderValidation";
import { getUserOrders } from "@/app/actions/orders/getOrder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "@/lib/utils/productPrice";
import Link from "next/link";
import { TailChase } from "ldrs/react";

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const result = await getUserOrders();

        if (result.success && result.orders) {
          setOrders(result.orders);
        } else {
          setError(result.error || "Failed to load orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("An error occurred while loading orders");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <TailChase size="40" speed="1.75" color="black" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <p className="text-muted-foreground">No orders yet</p>
          <Link href="/">
            <Button className="rounded-none">Start Shopping</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 max-w-200 mx-auto max-h-[600px] overflow-y-auto pr-2">
      {orders.map((order) => (
        <Card key={order.id} className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base md:text-lg">
                  Order {order.orderNumber}
                </CardTitle>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  {new Date(order.createdAt).toLocaleDateString()} •{" "}
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="font-medium text-base md:text-lg">
                  {getCurrencySymbol(order.totals.currency)}
                  {order.totals.total.toFixed(2)}
                </p>
                <div
                  className={`mt-1 inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2 justify-end">
              <Link href={`/profile/orders/${order.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none w-full sm:w-auto"
                >
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
