"use client";

import { ProductFilters as ProductFiltersType } from "@/Types/filterTypes";
import { FilterSection } from "./FilterSection";
import { Button } from "@/components/ui/button";

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onChange: (filters: ProductFiltersType) => void;
  availableValues: {
    brands: string[];
    categories: string[];
    sex: string[];
  };
}

export function ProductFilters({
  filters,
  onChange,
  availableValues,
}: ProductFiltersProps) {
  const hasActiveFilters =
    filters.brands.length > 0 ||
    filters.categories.length > 0 ||
    filters.sex.length > 0;

  const handleClearAll = () => {
    onChange({ brands: [], categories: [], sex: [] });
  };

  return (
    <div className="space-y-6 p-4 border rounded-none">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground hover:bg-transparent"
          >
            Clear All
          </Button>
        )}
      </div>

      <FilterSection
        title="Brand"
        options={availableValues.brands}
        selected={filters.brands}
        onChange={(brands) => onChange({ ...filters, brands })}
      />

      <FilterSection
        title="Category"
        options={availableValues.categories}
        selected={filters.categories}
        onChange={(categories) => onChange({ ...filters, categories })}
      />

      {availableValues.sex.length > 0 && (
        <FilterSection
          title="Gender"
          options={availableValues.sex}
          selected={filters.sex}
          onChange={(sex) => onChange({ ...filters, sex })}
        />
      )}
    </div>
  );
}
