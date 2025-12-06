import {
  getFilteredProducts,
  getFilterOptions,
} from "@/app/actions/products/getFiltered";
import { CustomerProductList } from "@/components/product/CustomerProductList";
import { H1 } from "@/components/ui/headings";

export default async function Home() {
  const [productsResult, filterOptionsResult] = await Promise.all([
    getFilteredProducts(
      { brands: [], categories: [], sex: [] },
      "newest",
      12,
      0
    ),
    getFilterOptions(),
  ]);

  if (!productsResult.success) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-destructive font-semibold">
              Error loading products
            </p>
            <p className="text-muted-foreground text-sm max-w-md">
              {productsResult.error.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!filterOptionsResult.success) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-destructive font-semibold">
              Error loading filter options
            </p>
            <p className="text-muted-foreground text-sm max-w-md">
              {filterOptionsResult.error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (productsResult.products.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-muted-foreground font-semibold">
              No products available
            </p>
            <p className="text-muted-foreground text-sm max-w-md">
              Check back soon for new arrivals
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <H1 className="text-center mt-8 mb-25">Products</H1>
      <CustomerProductList
        initialProducts={productsResult.products}
        totalProducts={productsResult.total}
        filterOptions={filterOptionsResult.values!}
      />
    </main>
  );
}
