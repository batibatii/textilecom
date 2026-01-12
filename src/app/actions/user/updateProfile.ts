"use server";

import { updateUserProfile } from "@/lib/firebase/dal/users";
import { revalidatePath } from "next/cache";
import { PersonalInfoSchema } from "@/Types/profileValidation";
import { getCurrentUserId } from "@/lib/auth/session";

export async function updateProfile(userId: string, formData: unknown) {
  const currentUserId = await getCurrentUserId();

  if (!currentUserId) {
    return {
      success: false,
      error: {
        code: "auth/unauthenticated",
        message: "You must be logged in to update your profile",
      },
    };
  }

  if (currentUserId !== userId) {
    return {
      success: false,
      error: {
        code: "auth/unauthorized",
        message: "You can only update your own profile",
      },
    };
  }

  const validationResult = PersonalInfoSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: {
        code: "validation/failed",
        message: "Invalid form data",
      },
    };
  }

  const { email: _email, ...profileData } = validationResult.data;

  const result = await updateUserProfile(userId, profileData);

  if (result.success) {
    revalidatePath("/profile");
  }

  return result;
}
