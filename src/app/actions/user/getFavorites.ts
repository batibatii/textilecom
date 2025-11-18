"use server";

import { getUserFavorites } from "@/lib/firebase/dal/users";

export async function getFavorites(userId: string) {
  const result = await getUserFavorites(userId);
  return result;
}
