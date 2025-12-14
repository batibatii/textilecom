import { format } from "date-fns";

// Helper function to convert Firestore Timestamp to ISO string
export const toISOString = (
  value: { toDate?: () => Date } | string | null | undefined
): string | null => {
  if (!value) return null;
  if (typeof value === "object" && value.toDate && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  return null;
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "Never";
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return "Invalid date";
  }
};
