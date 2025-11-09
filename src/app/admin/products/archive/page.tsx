import { getApprovedProducts } from "@/app/actions/admin/products/list";
import { ProductList } from "@/components/ProductList";

export default async function ApprovedProductsPage() {
  const result = await getApprovedProducts();

  if (!result.success) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl text-center font-bold mt-8 mb-10">
          Approved Products
        </h1>
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
        <h1 className="text-3xl text-center font-bold mt-8 mb-10">
          Approved Products
        </h1>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-muted-foreground font-semibold">
              No approved products found
            </p>
            <p className="text-muted-foreground text-sm max-w-md">
              Approve products from the main admin panel to see them here
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl text-center font-bold mt-8 mb-25">
        Approved Products
      </h1>
      <ProductList products={result.products} showMoveToDraft={true} />
    </main>
  );
}
