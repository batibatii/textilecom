import { Product } from "@/Types/productValidation";
import { CartItem } from "@/contexts/CartContext";

export const getNumericPrice = (product: Product): number => {
  return product.discount
    ? product.price.amount * (1 - product.discount.rate / 100)
    : product.price.amount;
};

export const hasDiscount = (product: Product): boolean => {
  return !!(product.discount && product.discount.rate > 0);
};

export const formatPrice = (
  amount: number,
  currency: string,
  locale: string = "en-US"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
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
