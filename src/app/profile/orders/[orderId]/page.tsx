"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Order } from "@/Types/orderValidation";
import { getOrderById } from "@/app/actions/orders/getOrder";
import { OrderDetail } from "@/components/order/OrderDetail";
import { Button } from "@/components/ui/button";
import { TailChase } from "ldrs/react";
import { ArrowLeft } from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const result = await getOrderById(orderId);

        if (result.success && result.order) {
          setOrder(result.order);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("An error occurred while loading the order");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center">
        <TailChase size="40" speed="1.75" color="black" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl mt-16 md:mt-20">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">
            {error || "Order not found"}
          </p>
          <Button
            onClick={() => router.push("/profile?section=orders")}
            className="rounded-none"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col mt-16 md:mt-20 px-4 py-6 md:py-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/profile?section=orders")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>

        <OrderDetail order={order} />
      </div>
    </main>
  );
}
