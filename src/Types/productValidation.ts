import { z } from "zod";

export const ProductFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  brand: z.string().min(1, "Brand is required"),
  serialNumber: z
    .string()
    .refine((val) => val !== undefined && val !== null && val.trim() !== "", {
      message: "Product Number is required",
    }),
  price: z
    .union([z.number().positive("Price must be positive"), z.nan()])
    .refine((val) => !isNaN(val), { message: "Price is required" }),
  currency: z.string().min(1, "Currency is required"),
  image: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  stock: z
    .union([
      z
        .number()
        .min(0, "Stock must be at least 0")
        .max(9999, "Stock cannot exceed 9999"),
      z.nan(),
    ])
    .refine((val) => !isNaN(val), { message: "Stock is required" }),
  discount: z
    .union([
      z
        .number()
        .min(0, "Discount must be at least 0")
        .max(30, "Discount cannot exceed 30"),
      z.nan(),
    ])
    .optional(),
  taxRate: z.string().min(1, "Tax rate is required"),
});

export type ProductFormData = z.infer<typeof ProductFormSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  brand: z.string(),
  serialNumber: z.string(),
  price: z.object({
    amount: z.number(),
    currency: z.string(),
  }),
  taxRate: z.string(),
  image: z.string(),
  category: z.string(),
  stock: z.number(),
  draft: z.boolean(),
  discount: z
    .object({
      rate: z.number(),
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;

export type NewProduct = Omit<Product, "id" | "createdAt" | "updatedAt">;
