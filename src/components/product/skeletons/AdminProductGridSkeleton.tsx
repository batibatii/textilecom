import { AdminProductCardSkeleton } from "@/components/product/skeletons/AdminProductCardSkeleton";

export function AdminProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-20">
      {Array.from({ length: 12 }).map((_, index) => (
        <AdminProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
