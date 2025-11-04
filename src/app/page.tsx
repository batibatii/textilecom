import { getProducts } from "@/app/actions/admin/products/list";
import { CustomerProductList } from "@/components/CustomerProductList";

export default async function Home() {
  const result = await getProducts();

  if (!result.success) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-destructive font-semibold">
              Error loading products
            </p>
            <p className="text-muted-foreground text-sm max-w-md">
              {result.error.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (result.products.length === 0) {
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
      <h1 className="text-3xl text-center font-bold mt-8 mb-25">
        All Products
      </h1>
      <CustomerProductList products={result.products} />
    </main>
  );
}
