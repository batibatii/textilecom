import { listOrders } from "@/app/actions/admin/orders/listOrders";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { H1 } from "@/components/ui/headings";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const result = await listOrders();

  if (!result.success) {
    return (
      <main className="container mx-auto px-4 py-8">
        <H1 className="text-center mt-8 mb-10">Order Management</H1>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-destructive font-semibold text-sm">
              Error loading orders
            </p>
            <p className="text-muted-foreground text-sm max-w-md">
              {result.error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!result.orders || result.orders.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <H1 className="text-center mt-8 mb-10">Order Management</H1>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-muted-foreground font-semibold text-sm">
              No orders found
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <H1 className="text-center mt-8 mb-20">Order Management</H1>
      <OrdersTable orders={result.orders} />
    </main>
  );
}
