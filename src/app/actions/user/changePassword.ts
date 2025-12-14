"use server";

import { changeUserPassword } from "@/lib/firebase/dal/users";
import { ChangePasswordSchema } from "@/Types/profileValidation";

export async function changePassword(userId: string, formData: unknown) {
  const validationResult = ChangePasswordSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: {
        code: "validation/failed",
        message: "Invalid form data",
      },
    };
  }

  const { newPassword } = validationResult.data;

  const result = await changeUserPassword(userId, newPassword);

  return result;
}
