import { Product } from "@/Types/productValidation";
import {
  getNumericPrice,
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
  const numericPrice = getNumericPrice(product);

  if (!hasDiscount) {
    return (
      <span className={priceSpanClassName}>
        {formatPrice(numericPrice, product.price.currency)}
      </span>
    );
  }

  return (
    <>
      <span className={priceClassName}>
        {formatPrice(product.price.amount, product.price.currency)}
      </span>
      <span className={priceSpanClassName}>
        {formatPrice(numericPrice, product.price.currency)}
      </span>
      {showDiscount && (
        <span className={discountClassName}>-{product?.discount?.rate}%</span>
      )}
    </>
  );
}
