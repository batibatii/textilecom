"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getOrderById } from "@/app/actions/admin/orders/getOrderById";
import type { Order } from "@/Types/orderValidation";
import { formatDate } from "@/lib/utils/dateFormatter";
import { formatPrice } from "@/lib/utils/productPrice";
import Image from "next/image";
import { useAsyncData } from "@/hooks/useAsyncData";

interface OrderDetailDialogProps {
  orderId: string | null;
  onClose: () => void;
}

export function OrderDetailDialog({
  orderId,
  onClose,
}: OrderDetailDialogProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const fetchOperation = useAsyncData<Order>();

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      return;
    }

    const fetchOrder = async () => {
      await fetchOperation.execute(async () => {
        const result = await getOrderById(orderId);
        if (result.success && result.order) {
          setOrder(result.order);
          return result.order;
        } else {
          throw new Error("Order not found");
        }
      });
    };

    fetchOrder();
  }, [orderId, fetchOperation.execute]);

  return (
    <Dialog open={!!orderId} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl rounded-none p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {fetchOperation.loading
              ? "Loading Order..."
              : !order
              ? "Order Not Found"
              : `Order ${order.orderNumber}`}
          </DialogTitle>
        </DialogHeader>

        {fetchOperation.loading ? (
          <div className="flex justify-center py-8 text-sm text-muted-foreground">
            Loading...
          </div>
        ) : !order ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Order not found
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b pb-6 -mt-2">
              <p className="text-sm text-muted-foreground">
                Placed on {formatDate(order.createdAt)}
              </p>
              <span className="inline-flex items-center rounded-none bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 capitalize">
                {order.status}
              </span>
            </div>

            <div className="space-y-6">
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Items</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative w-24 h-24 bg-gray-100 rounded shrink-0">
                        <Image
                          src={item.image || "/placeholder.png"}
                          alt={item.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-base">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground uppercase">
                          {item.brand}
                        </p>
                        {item.size && (
                          <p className="text-sm text-muted-foreground">
                            Size: {item.size}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(item.total, item.price.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(item.price.amount, item.price.currency)}{" "}
                          each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      {formatPrice(
                        order.totals.subtotal,
                        order.totals.currency
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>
                      {formatPrice(order.totals.tax, order.totals.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>
                      {formatPrice(order.totals.total, order.totals.currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Contact Information
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Email: </span>
                    {order.customerInfo.email}
                  </p>
                  {order.customerInfo.name && (
                    <p>
                      <span className="text-muted-foreground">Name: </span>
                      {order.customerInfo.name}
                    </p>
                  )}
                  {order.customerInfo.phone && (
                    <p>
                      <span className="text-muted-foreground">Phone: </span>
                      {order.customerInfo.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
