"use client";

import { useCart } from "@/app/CartProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { H1 } from "@/components/ui/headings";
import {
  getCurrencySymbol,
  calculateDiscountedPrice,
} from "@/lib/productPrice";
import { handleCheckout } from "@/app/actions/checkout";
import { useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, getSubtotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taxRate = 1.2; // 20% tax

  const total = getSubtotal(); // Total with tax included
  const subtotal = total / taxRate;
  const tax = total - subtotal;

  // Get currency from first item
  const currency = items.length > 0 ? items[0].price.currency : "USD";

  const onCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await handleCheckout(
        items.map((item) => ({
          productId: item.productId,
          title: item.title,
          brand: item.brand,
          price: item.price,
          discount: item.discount,
          size: item.size,
          quantity: item.quantity,
          stripePriceId: item.stripePriceId,
          taxRate: item.taxRate,
        }))
      );

      if (result.success) {
        // Redirect to Stripe Checkout
        window.location.href = result.sessionUrl;
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError("An error occurred while processing your request");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-xl text-muted-foreground">Your cart is empty</p>
            <Link href="/">
              <Button>Continue Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-12 max-w-4xl">
      <H1 className="mb-8 tracking-wide text-center lg:text-start">
        CHECKOUT
      </H1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="antialiased">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => {
                const itemPrice = calculateDiscountedPrice(
                  item.price.amount,
                  item.discount
                );

                return (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex justify-between items-start py-2 border-b last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.brand}
                        {item.size ? ` • Size: ${item.size}` : ""} • Qty:{" "}
                        {item.quantity}
                      </p>
                      {item.discount && item.discount.rate > 0 && (
                        <span className="inline-block mt-1 text-xs font-semibold text-green-900 bg-green-50 px-2 py-0.5 rounded">
                          -{item.discount.rate}% OFF
                        </span>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      {item.discount && item.discount.rate > 0 && (
                        <p className="text-xs text-muted-foreground line-through">
                          {getCurrencySymbol(currency)}
                          {(item.price.amount * item.quantity).toFixed(2)}
                        </p>
                      )}
                      <p className="font-medium">
                        {getCurrencySymbol(currency)}
                        {(itemPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="antialiased">Total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {getCurrencySymbol(currency)}
                  {subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">
                  {getCurrencySymbol(currency)}
                  {tax.toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>
                    {getCurrencySymbol(currency)}
                    {total.toFixed(2)}
                  </span>
                </div>
              </div>
              <Button
                onClick={onCheckout}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "PROCESSING..." : "PROCEED TO PAYMENT"}
              </Button>
              <Link href="/cart" className="block">
                <Button variant="outline" className="w-full">
                  Back to Cart
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
