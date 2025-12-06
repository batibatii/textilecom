export type SortOption = "price-asc" | "price-desc" | "newest" | "oldest";

export interface AdminProductFilters {
  categories: string[];
}

export interface AdminFilterState extends AdminProductFilters {
  sortBy: SortOption;
}
