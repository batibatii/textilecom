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
    .union([z.number().nonnegative("Stock must be a positive number"), z.nan()])
    .refine((val) => !isNaN(val), { message: "Stock is required" }),
  discount: z.union([z.number(), z.nan()]).optional(),
});

export type ProductFormData = z.infer<typeof ProductFormSchema>;
