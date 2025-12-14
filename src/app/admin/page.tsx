import { getDraftProducts } from "@/app/actions/admin/products/list";
import { ProductList } from "@/components/product/ProductList";
import { H1 } from "@/components/ui/headings";

export default async function AdminPanel() {
  const result = await getDraftProducts();

  if (!result.success) {
    return (
      <main className="container mx-auto px-4 py-8">
        <H1 className="text-center mt-8 mb-10">
          Product Management
        </H1>
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
        <H1 className="text-center mt-8 mb-10">
          Product Management
        </H1>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-muted-foreground font-semibold">
              No products found
            </p>
            <p className="text-muted-foreground text-sm max-w-md">
              Start by creating your first product
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <H1 className="text-center mt-8 mb-25">
        Product Management
      </H1>
      <ProductList products={result.products} />
    </main>
  );
}
