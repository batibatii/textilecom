export type SortOption = "price-asc" | "price-desc" | "newest" | "oldest";

export interface AdminProductFilters {
  categories: string[];
  searchQuery?: string;
}

export interface AdminFilterState extends AdminProductFilters {
  sortBy: SortOption;
}
