import { z } from "zod";

export const OrderItemSchema = z.object({
  productId: z.string(),
  title: z.string(),
  brand: z.string(),
  price: z.object({
    amount: z.number(),
    currency: z.string(),
  }),
  discount: z
    .object({
      rate: z.number(),
    })
    .nullable(),
  size: z.string().optional(),
  quantity: z.number(),
  image: z.string(),
  taxRate: z.string(),
  // Calculated fields
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
});

export const OrderStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
]);

export const OrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  orderNumber: z.string(),
  stripeSessionId: z.string(),
  stripePaymentIntentId: z.string(),
  status: OrderStatusSchema,
  items: z.array(OrderItemSchema),
  totals: z.object({
    subtotal: z.number(),
    tax: z.number(),
    total: z.number(),
    currency: z.string(),
  }),
  customerInfo: z.object({
    email: z.string(),
    name: z.string().optional(),
    phone: z.string().optional(),
    address: z
      .object({
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        postalCode: z.string(),
        country: z.string(),
      })
      .optional(),
    billingAddress: z
      .object({
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        postalCode: z.string(),
        country: z.string(),
      })
      .optional(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
  paymentCompletedAt: z.string().optional(),

  metadata: z.record(z.string(), z.string()).optional(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type Order = z.infer<typeof OrderSchema>;
