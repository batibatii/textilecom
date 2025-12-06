export type SortOption = "price-asc" | "price-desc" | "newest" | "oldest";

export interface ProductFilters {
  brands: string[];
  categories: string[];
  sex: string[];
}

export interface FilterState extends ProductFilters {
  sortBy: SortOption;
}
