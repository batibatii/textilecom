import { Product } from "@/Types/productValidation";
import {
  getCurrencySymbol,
  getDisplayPrice,
  hasDiscount as checkHasDiscount,
  formatPrice,
} from "@/lib/utils/productPrice";

interface PriceDisplayProps {
  product: Product;
  showDiscount?: boolean;
  priceSpanClassName?: string;
  priceClassName?: string;
  discountClassName?: string;
}

export function PriceDisplay({
  product,
  showDiscount = true,
  priceSpanClassName = "text-xl font-medium",
  priceClassName = "text-base text-muted-foreground line-through",
  discountClassName = "text-sm font-semibold text-green-900 bg-green-50 px-2 py-1 rounded",
}: PriceDisplayProps) {
  const hasDiscount = checkHasDiscount(product);
  const currencySymbol = getCurrencySymbol(product.price.currency);
  const displayPrice = getDisplayPrice(product);

  if (!hasDiscount) {
    return (
      <span className={priceSpanClassName}>
        {currencySymbol}
        {displayPrice}
      </span>
    );
  }

  return (
    <>
      <span className={priceClassName}>
        {formatPrice(product.price.amount, product.price.currency)}
      </span>
      <span className={priceSpanClassName}>
        {currencySymbol}
        {displayPrice}
      </span>
      {showDiscount && (
        <span className={discountClassName}>-{product?.discount?.rate}%</span>
      )}
    </>
  );
}
