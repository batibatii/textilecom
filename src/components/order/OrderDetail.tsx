"use client";

import { Order } from "@/Types/orderValidation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrencySymbol } from "@/lib/utils/productPrice";
import Image from "next/image";

interface OrderDetailProps {
  order: Order;
}

export function OrderDetail({ order }: OrderDetailProps) {
  const currency = order.totals.currency;

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <CardTitle>Order {order.orderNumber}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div
                className={`inline-block px-3 py-1 rounded-none text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-6">
            {order.items.map((item, index) => (
              <div
                key={`${item.productId}-${index}`}
                className="flex gap-4 pb-4 border-b last:border-b-0"
              >
                <div className="relative w-20 h-20 bg-muted shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.brand}</p>
                  {item.size && (
                    <p className="text-sm text-muted-foreground">
                      Size: {item.size}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                  {item.discount && item.discount.rate > 0 && (
                    <p className="text-sm text-green-600">
                      {item.discount.rate}% discount applied
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="font-medium">
                    {getCurrencySymbol(currency)}
                    {item.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getCurrencySymbol(currency)}
                    {(item.total / item.quantity).toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {getCurrencySymbol(currency)}
              {order.totals.subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium">
              {getCurrencySymbol(currency)}
              {order.totals.tax.toFixed(2)}
            </span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>
                {getCurrencySymbol(currency)}
                {order.totals.total.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {order.customerInfo.address && (
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              {order.customerInfo.name && (
                <p className="font-medium">{order.customerInfo.name}</p>
              )}
              <p>{order.customerInfo.address.line1}</p>
              {order.customerInfo.address.line2 && (
                <p>{order.customerInfo.address.line2}</p>
              )}
              <p>
                {order.customerInfo.address.city},{" "}
                {order.customerInfo.address.postalCode}
              </p>
              <p>{order.customerInfo.address.country}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">Email: </span>
              {order.customerInfo.email}
            </p>
            {order.customerInfo.phone && (
              <p>
                <span className="text-muted-foreground">Phone: </span>
                {order.customerInfo.phone}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
