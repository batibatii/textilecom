import "server-only";

import { stripe } from "./client";
import { Product } from "@/Types/productValidation";
import Stripe from "stripe";

export interface SyncProductResult {
  success: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
  error?: string;
}

async function createOrUpdateStripeProduct(
  product: Product
): Promise<Stripe.Product | null> {
  try {
    const productData: Stripe.ProductCreateParams = {
      name: product.title,
      description: product.description,
      metadata: {
        productId: product.id,
        brand: product.brand,
        serialNumber: product.serialNumber,
        category: product.category,
        ...(product.discount?.rate && { discountRate: product.discount.rate.toString() }),
      },
      active: !product.draft,
    };

    // Add first image URL directly (Stripe accepts URLs)
    if (product.images && product.images.length > 0) {
      productData.images = [product.images[0]];
    }

    if (product.stripeProductId) {
      const updatedProduct = await stripe.products.update(
        product.stripeProductId,
        productData
      );
      return updatedProduct;
    }

    const stripeProduct = await stripe.products.create(productData);
    return stripeProduct;
  } catch (error) {
    console.error("Error creating/updating Stripe product:", error);
    return null;
  }
}

// Note: Prices are immutable in Stripe. If price changes, create a new Price object.
async function createStripePrice(
  stripeProductId: string,
  product: Product
): Promise<Stripe.Price | null> {
  try {
    // Convert amount to cents (Stripe requires smallest currency unit)
    const unitAmount = Math.round(product.price.amount * 100);

    const priceData: Stripe.PriceCreateParams = {
      product: stripeProductId,
      unit_amount: unitAmount,
      currency: product.price.currency.toLowerCase(),
      metadata: {
        productId: product.id,
        taxRate: product.taxRate,
      },
    };

    const stripePrice = await stripe.prices.create(priceData);
    return stripePrice;
  } catch (error) {
    console.error("Error creating Stripe price:", error);
    return null;
  }
}

async function checkIfPriceNeedsUpdate(product: Product): Promise<boolean> {
  if (!product.stripePriceId) {
    return true;
  }

  try {
    const currentPrice = await stripe.prices.retrieve(product.stripePriceId);
    const newAmount = Math.round(product.price.amount * 100);

    return (
      currentPrice.unit_amount !== newAmount ||
      currentPrice.currency !== product.price.currency.toLowerCase()
    );
  } catch (error) {
    console.error("Error checking price:", error);
    return true; // If we can't check, assume it needs update
  }
}

export async function syncProductToStripe(
  product: Product
): Promise<SyncProductResult> {
  try {
    if (product.draft) {
      return {
        success: false,
        error:
          "Product is still in draft. Only approved products are synced to Stripe.",
      };
    }

    // Image URL is passed directly from product.images[0]
    const stripeProduct = await createOrUpdateStripeProduct(product);
    if (!stripeProduct) {
      return {
        success: false,
        error: "Failed to create/update product in Stripe",
      };
    }

    const priceNeedsUpdate = await checkIfPriceNeedsUpdate(product);

    let stripePriceId = product.stripePriceId;

    if (priceNeedsUpdate) {
      const stripePrice = await createStripePrice(stripeProduct.id, product);
      if (!stripePrice) {
        return {
          success: false,
          error: "Failed to create price in Stripe",
        };
      }
      stripePriceId = stripePrice.id;
    }

    return {
      success: true,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePriceId,
    };
  } catch (error) {
    console.error("Error syncing product to Stripe:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
