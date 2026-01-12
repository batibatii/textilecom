// Format: ORD-{value after first dash}-{counter number}
export function formatOrderNumberShort(orderNumber: string): string {
  if (!orderNumber || !orderNumber.startsWith("ORD-")) {
    return orderNumber;
  }

  // Split by dashes
  const parts = orderNumber.split("-");

  if (parts.length < 3) {
    return orderNumber;
  }

  // Get the first segment after ORD- and the last segment (counter)
  const firstSegment = parts[1]; // e.g., "2df30cb5"
  const counterSegment = parts[parts.length - 1]; // e.g., "000001"

  return `ORD-${firstSegment}-${counterSegment}`;
}
