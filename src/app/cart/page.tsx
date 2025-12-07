"use client";

import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H1, H3 } from "@/components/ui/headings";
import Image from "next/image";
import Link from "next/link";
import {
  getCurrencySymbol,
  formatPrice,
  calculateDiscountedPrice,
} from "@/lib/utils/productPrice";
import { Trash2, MapPin } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCart();
  const { user } = useAuth();

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
      <H1 className="text-center lg:text-start mb-8 tracking-wide">
        SHOPPING CART
      </H1>

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
                  <div className="flex gap-4 items-stretch">
                    <div className="relative w-24 min-h-32 bg-muted shrink-0 ">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-fit"
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
                        <H3 className="text-shadow-2xs">{item.title}</H3>
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

                      <div className="flex items-center justify-between">
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

                        <div className="flex items-center gap-2">
                          <div className="ml-4 text-right">
                            {item.discount && item.discount.rate > 0 && (
                              <div className="space-y-0.5">
                                <p className="text-xs text-muted-foreground line-through">
                                  {formatPrice(item.price.amount, currency)}
                                </p>
                              </div>
                            )}
                            <p className="text-sm md:text-lg font-medium">
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

        <div className="lg:col-span-1 space-y-4">
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
                <Button className="w-full text-xs rounded-none" size="lg">
                  PROCEED TO CHECKOUT
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full text-xs ">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>

          {user && user.address && (
            <Card>
              <CardHeader>
                <CardTitle className="antialiased flex items-center gap-2">
                  <MapPin size={18} />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.address.line1 ||
                user.address.city ||
                user.address.postalCode ||
                user.address.country ? (
                  <div className="space-y-1 text-sm">
                    {user.address.line1 && (
                      <p className="text-gray-700">{user.address.line1}</p>
                    )}
                    {user.address.line2 && (
                      <p className="text-gray-700">{user.address.line2}</p>
                    )}
                    {(user.address.city || user.address.postalCode) && (
                      <p className="text-gray-700">
                        {[user.address.city, user.address.postalCode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                    {user.address.country && (
                      <p className="text-gray-700">{user.address.country}</p>
                    )}
                    <Link href="/profile" className="block pt-2">
                      <Button variant="default" className="p-2 h-auto text-xs">
                        Edit Address
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      No shipping address added yet.
                    </p>
                    <Link href="/profile" className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        Add Address
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
