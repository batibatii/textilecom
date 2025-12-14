"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getOrderBySessionId } from "@/app/actions/orders/getOrder";
import { Order } from "@/Types/orderValidation";
import { formatPrice } from "@/lib/utils/productPrice";
import Image from "next/image";
import { TailChase } from "ldrs/react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);

  const MAX_ATTEMPTS = 20; // 20 attempts × 2 seconds = 40 seconds max wait
  const POLL_INTERVAL = 3000; // 3 seconds

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    let interval: NodeJS.Timeout | null = null;
    let isActive = true;

    const pollOrder = async (): Promise<boolean> => {
      if (!isActive) return false;

      try {
        const result = await getOrderBySessionId(sessionId);

        if (result.success && result.order) {
          console.log("✅ Order found!");
          if (isActive) {
            setOrder(result.order);
            setLoading(false);
          }
          return true; // Stop polling
        }

        console.log("⏳ Order not ready yet, will retry...");
        return false; // Continue polling
      } catch (err) {
        console.error("❌ Error fetching order:", err);
        return false;
      }
    };

    // Initial poll
    pollOrder().then((found) => {
      if (found || !isActive) return;

      // Set up interval polling
      let attemptCount = 0;
      interval = setInterval(async () => {
        attemptCount++;

        if (attemptCount >= MAX_ATTEMPTS) {
          if (interval) clearInterval(interval);
          if (isActive) {
            setTimedOut(true);
            setLoading(false);
          }
          return;
        }

        const found = await pollOrder();
        if (found && interval) {
          clearInterval(interval);
        }
      }, POLL_INTERVAL);
    });

    return () => {
      isActive = false;
      if (interval) clearInterval(interval);
    };
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl mt-12 md:mt-60">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-xl text-muted-foreground">Invalid session</p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl mt-12 md:mt-60">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <TailChase size="40" speed="1.75" color="black" />
            <p className="text-lg font-medium">Processing your order...</p>
            <p className="text-sm text-muted-foreground">
              This usually takes a few seconds
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (timedOut && !order) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl mt-12 md:mt-60">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-3">
              <p className="text-lg font-medium text-green-600">
                Your payment has been processed successfully
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-blue-900">
                  Your order is being prepared
                </p>
                <p className="text-sm text-blue-700">
                  We&apos;re creating your order details. This may take a
                  moment.
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <p className="text-sm text-muted-foreground">
                  ✓ Payment confirmed
                </p>
                <p className="text-sm text-muted-foreground">
                  ✓ Order confirmation email will arrive shortly
                </p>
                <p className="text-sm text-muted-foreground">
                  ✓ Your order will appear in your order history within a few
                  minutes
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center sm:flex-row gap-4 justify-center pt-4">
              <Link href="/profile?section=orders">
                <Button variant="outline" size="lg" className="rounded-none">
                  View Order History
                </Button>
              </Link>
              <Link href="/">
                <Button variant="default" size="lg" className="rounded-none">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Order not found after timeout (shouldn't happen, but just in case)
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl mt-12 md:mt-60">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-xl text-muted-foreground">
              Unable to load order details
            </p>
            <p className="text-sm text-muted-foreground">
              Please check your email or order history
            </p>
            <div className="flex gap-4 pt-4">
              <Link href="/profile?section=orders">
                <Button variant="outline">View Orders</Button>
              </Link>
              <Link href="/">
                <Button>Go Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currency = order.totals.currency;

  return (
    <div className="container mx-auto px-4 py-16 md:py-0 max-w-4xl mt-10 md:mt-10 ">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl ml-12">
            Thank You for Your Purchase!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">Order {order.orderNumber}</p>
            <p className="text-sm text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to {order.customerInfo.email}
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
              {order.items.map((item, index) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="flex gap-4 pb-4 border-b last:border-b-0"
                >
                  <div className="relative w-16 h-16 bg-muted shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {item.brand}
                    </p>
                    {item.size && (
                      <p className="text-xs text-muted-foreground">
                        Size: {item.size}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {formatPrice(item.total, currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatPrice(order.totals.subtotal, currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">
                  {formatPrice(order.totals.tax, currency)}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>
                    {formatPrice(order.totals.total, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center sm:flex-row gap-4 justify-center pt-4">
            <Link href="/profile?section=orders">
              <Button
                variant="outline"
                size="lg"
                className="rounded-none shadow-sm"
              >
                VIEW ORDER HISTORY
              </Button>
            </Link>
            <Link href="/">
              <Button variant="default" size="lg" className="rounded-none">
                CONTINUE SHOPPING
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
