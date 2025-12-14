import { OrderStatus } from "./orderValidation";

export interface OrderTableData {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerEmail: string;
  status: OrderStatus;
  total: number;
  currency: string;
}

export type SortField =
  | "orderNumber"
  | "createdAt"
  | "customerEmail"
  | "status"
  | "total";

export type SortDirection = "asc" | "desc" | null;
