import { CustomerProductGridSkeleton } from "@/components/product/skeletons/CustomerProductGridSkeleton";
import { H1 } from "@/components/ui/headings";

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <H1 className="text-center mt-8 mb-25">
        All Products
      </H1>
      <CustomerProductGridSkeleton />
    </main>
  );
}
