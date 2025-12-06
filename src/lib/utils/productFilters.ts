import { Product } from "@/Types/productValidation";
import { ProductFilters, SortOption } from "@/Types/filterTypes";
import { getNumericPrice } from "@/lib/utils/productPrice";

export function isApprovedProduct(product: unknown): product is Product {
  return (product as { draft?: boolean }).draft === false;
}

export function isDraftProduct(product: unknown): boolean {
  return (product as { draft?: boolean }).draft === true;
}

export function filterProducts(
  products: Product[],
  filters: ProductFilters
): Product[] {
  return products.filter((product) => {
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
      return false;
    }

    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.category)
    ) {
      return false;
    }

    if (
      filters.sex.length > 0 &&
      (!product.sex || !filters.sex.includes(product.sex))
    ) {
      return false;
    }

    return true;
  });
}

export function sortByNewest<T extends { createdAt: string | Date }>(
  products: T[]
): T[] {
  return [...products].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
}

export function sortProducts(
  products: Product[],
  sortBy: SortOption
): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => {
        const priceA = getNumericPrice(a);
        const priceB = getNumericPrice(b);
        return priceA - priceB;
      });
    case "price-desc":
      return sorted.sort((a, b) => {
        const priceA = getNumericPrice(a);
        const priceB = getNumericPrice(b);
        return priceB - priceA;
      });
    case "newest":
      return sortByNewest(sorted);
    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    default:
      return sorted;
  }
}

export function getUniqueFilterValues(products: Product[]) {
  const brands = new Set<string>();
  const categories = new Set<string>();
  const sexOptions = new Set<string>();

  products.forEach((product) => {
    brands.add(product.brand);
    categories.add(product.category);
    if (product.sex) sexOptions.add(product.sex);
  });

  return {
    brands: Array.from(brands).sort(),
    categories: Array.from(categories).sort(),
    sex: Array.from(sexOptions).sort(),
  };
}
