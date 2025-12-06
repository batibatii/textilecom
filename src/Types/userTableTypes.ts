export type SortField =
  | "email"
  | "createdAt"
  | "lastLoginAt"
  | "orderCount"
  | "role";
export type SortDirection = "asc" | "desc" | null;

export interface UserTableSortState {
  field: SortField | null;
  direction: SortDirection;
}
