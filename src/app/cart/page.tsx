"use client";

import { useCart } from "@/app/CartProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import {
  getCurrencySymbol,
  formatPrice,
  calculateDiscountedPrice,
} from "@/lib/productPrice";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCart();

  const total = getSubtotal(); // Total with tax included
  const subtotal = total / 1.2;
  const tax = total - subtotal;

  // Get currency from first item (assuming all items have same currency)
  const currency = items.length > 0 ? items[0].price.currency : "USD";

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 mt-30 md:mt-70 max-w-4xl">
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
    <div className="container mx-auto mt-12 px-4 py-8 max-w-6xl">
      <h1 className="text-3xl text-center lg:text-start font-bold mb-8 tracking-wide antialiased ">
        SHOPPING CART
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4 max-h-[800px] overflow-y-auto">
          {items.map((item) => {
            const itemPrice = calculateDiscountedPrice(
              item.price.amount,
              item.discount
            );

            return (
              <Card key={`${item.productId}-${item.size}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-32 bg-muted shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-lg text-shadow-2xs">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.brand}
                        </p>
                        {item.size && (
                          <p className="text-sm text-muted-foreground">
                            Size: {item.size}
                          </p>
                        )}
                        {item.discount && item.discount.rate > 0 && (
                          <span className="inline-block mt-1 text-xs font-semibold text-green-900 bg-green-50 px-2 py-0.5 rounded">
                            -{item.discount.rate}% OFF
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.quantity - 1
                              )
                            }
                            className="w-8 h-8 border border-gray-300 hover:border-gray-900 transition-colors flex items-center justify-center text-sm font-medium cursor-pointer"
                          >
                            −
                          </button>
                          <span className="text-sm font-medium min-w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.quantity + 1
                              )
                            }
                            className="w-8 h-8 border border-gray-300 hover:border-gray-900 transition-colors flex items-center justify-center text-sm font-medium cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            {item.discount && item.discount.rate > 0 && (
                              <p className="text-xs text-muted-foreground line-through">
                                {formatPrice(item.price.amount, currency)}
                              </p>
                            )}
                            <p className="text-lg font-medium">
                              {getCurrencySymbol(currency)}
                              {(itemPrice * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              removeItem(item.productId, item.size)
                            }
                            className="text-red-500 hover:text-red-700 transition-colors p-2 cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="antialiased">Order Summary</CardTitle>
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
              <Link href="/checkout" className="block">
                <Button className="w-full text-xs" size="lg">
                  PROCEED TO CHECKOUT
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full text-xs">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
