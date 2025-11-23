"use server";

import { updateUserProfile } from "@/lib/firebase/dal/users";
import { revalidatePath } from "next/cache";
import { PersonalInfoSchema } from "@/types/profileValidation";

export async function updateProfile(userId: string, formData: unknown) {

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
