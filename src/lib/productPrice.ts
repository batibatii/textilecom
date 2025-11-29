import { Product } from "@/Types/productValidation";
import { CartItem } from "@/contexts/CartContext";

export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    TRY: "₺",
  };
  return symbols[currency] || currency;
};

export const getDisplayPrice = (product: Product): string => {
  const displayPrice = product.discount
    ? (product.price.amount * (1 - product.discount.rate / 100)).toFixed(2)
    : product.price.amount.toFixed(2);
  return displayPrice;
};

export const hasDiscount = (product: Product): boolean => {
  return !!(product.discount && product.discount.rate > 0);
};

export const formatPrice = (amount: number, currency: string): string => {
  return `${getCurrencySymbol(currency)}${amount.toFixed(2)}`;
};

export const calculateDiscountedPrice = (
  amount: number,
  discount: { rate: number } | null
): number => {
  if (!discount || discount.rate <= 0) {
    return amount;
  }
  return amount * (1 - discount.rate / 100);
};

export const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const discountedPrice = calculateDiscountedPrice(
      item.price.amount,
      item.discount
    );
    return total + discountedPrice * item.quantity;
  }, 0);
};
