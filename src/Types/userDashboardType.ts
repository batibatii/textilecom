export type UserDashboardData = {
  id: string;
  email: string;
  role: "customer" | "admin" | "superAdmin";
  createdAt: string;
  lastLoginAt: string | null;
  orderCount: number;
};
