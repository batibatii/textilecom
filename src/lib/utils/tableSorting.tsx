import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export type SortDirection = "asc" | "desc" | null;

export function getSortIcon<T extends string>(
  currentField: T | null,
  targetField: T,
  direction: SortDirection
) {
  if (currentField !== targetField) {
    return <ArrowUpDown className="ml-1 h-3 w-3 inline" />;
  }
  if (direction === "asc") {
    return <ArrowUp className="ml-1 h-3 w-3 inline" />;
  }
  return <ArrowDown className="ml-1 h-3 w-3 inline" />;
}
