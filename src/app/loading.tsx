import { CustomerProductGridSkeleton } from "@/components/CustomerProductGridSkeleton";

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl text-center font-bold mt-8 mb-25">
        All Products
      </h1>
      <CustomerProductGridSkeleton />
    </main>
  );
}
