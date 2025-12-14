// Helper function to convert Firestore Timestamp to ISO string
export const toISOString = (
  value: { toDate?: () => Date } | string | null | undefined
): string | null => {
  if (!value) return null;
  if (
    typeof value === "object" &&
    value.toDate &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  return null;
};

export const formatDate = (
  dateString: string | null,
  locale: string = "en-US"
): string => {
  if (!dateString) return "Never";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return "Invalid date";
  }
};
