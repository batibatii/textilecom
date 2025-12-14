"use client";

import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { H1 } from "@/components/ui/headings";
import { ErrorAlert } from "@/components/alert/ErrorAlert";
import {
  formatPrice,
  calculateDiscountedPrice,
} from "@/lib/utils/productPrice";
import { handleCheckout } from "@/app/actions/checkout";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { useAsyncData } from "@/hooks/useAsyncData";

export default function CheckoutPage() {
  const { items, getSubtotal } = useCart();
  const { user } = useAuth();
  const checkoutOperation = useAsyncData();

  const taxRate = 1.2; // 20% tax

  const total = getSubtotal(); // Total with tax included
  const subtotal = total / taxRate;
  const tax = total - subtotal;

  // Get currency from first item
  const currency = items.length > 0 ? items[0].price.currency : "USD";

  const onCheckout = async () => {
    await checkoutOperation.execute(async () => {
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
        throw new Error(result.error);
      }
    });
  };

  // Check if user has an address (all users need address to checkout)
  const hasAddress =
    user?.address &&
    user.address.line1 &&
    user.address.city &&
    user.address.postalCode &&
    user.address.country;

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
      <H1 className="mb-8 tracking-wide text-center lg:text-start">CHECKOUT</H1>

      <ErrorAlert message={checkoutOperation.error} className="mb-6" />

      {!hasAddress && (
        <Alert className="mb-6 border-amber-500 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            Please add your shipping address before checkout.{" "}
            <Link
              href="/profile"
              className="font-medium underline hover:no-underline"
            >
              Go to Profile
            </Link>
          </AlertDescription>
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
                          {formatPrice(
                            item.price.amount * item.quantity,
                            currency
                          )}
                        </p>
                      )}
                      <p className="font-medium">
                        {formatPrice(itemPrice * item.quantity, currency)}
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
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">
                  {formatPrice(tax, currency)}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>
                    {formatPrice(total, currency)}
                  </span>
                </div>
              </div>
              <LoadingButton
                onClick={onCheckout}
                loading={checkoutOperation.loading}
                loadingText="PROCESSING..."
                disabled={!hasAddress}
                className="w-full rounded-none"
              >
                {!hasAddress ? "ADD ADDRESS TO CHECKOUT" : "PROCEED TO PAYMENT"}
              </LoadingButton>
              <Link href="/cart" className="block">
                <Button variant="outline" className="w-full">
                  BACK TO CART
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
