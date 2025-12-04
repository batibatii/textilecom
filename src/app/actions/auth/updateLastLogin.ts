"use server";

import { updateLastLogin } from "@/lib/firebase/dal/users";

export async function updateUserLastLogin(userId: string) {
  return await updateLastLogin(userId);
}
