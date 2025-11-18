import { z } from "zod";

const CheckoutItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  title: z.string().min(1, "Product title is required"),
  brand: z.string().min(1, "Brand is required"),
  price: z.object({
    amount: z.number().positive("Price must be positive"),
    currency: z.string().length(3, "Currency must be 3 characters (e.g., USD)"),
  }),
  discount: z
    .object({
      rate: z.number().min(0).max(100),
    })
    .nullable(),
  size: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  stripePriceId: z.string().min(1, "Stripe Price ID is required"),
  taxRate: z.string().min(1, "Tax rate is required"),
});

export const CheckoutSchema = z.object({
  items: z
    .array(CheckoutItemSchema)
    .min(1, "At least one item is required for checkout"),
});

export type CheckoutItem = z.infer<typeof CheckoutItemSchema>;
export type CheckoutData = z.infer<typeof CheckoutSchema>;
