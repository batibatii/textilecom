import { z } from "zod";

export const PersonalInfoSchema = z.object({
  email: z.email("Invalid email address"),
  phoneCountryCode: z
    .string()
    .regex(/^\+\d{1,4}$/, "Country code must start with + and contain 1-4 digits (e.g., +1, +31)"),
  phoneNumber: z
    .string()
    .regex(/^\d{7,15}$/, "Phone number must be 7-15 digits only"),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type PersonalInfoData = z.infer<typeof PersonalInfoSchema>;
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;
