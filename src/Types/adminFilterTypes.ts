export type SortOption = "price-asc" | "price-desc" | "newest" | "oldest";

export interface AdminProductFilters {
  brands: string[];
  categories: string[];
  searchQuery?: string;
}

export interface AdminFilterState extends AdminProductFilters {
  sortBy: SortOption;
}
