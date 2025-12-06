"use client";

import { SortOption } from "@/Types/filterTypes";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";

interface ProductSortingProps {
  sortBy: SortOption;
  onChange: (sort: SortOption) => void;
}

export function ProductSorting({ sortBy, onChange }: ProductSortingProps) {
  return (
    <div className="space-y-3 p-4 border rounded-none">
      <Label className="font-semibold text-sm">Sort By</Label>
      <NativeSelect
        value={sortBy}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="w-full h-9 text-sm rounded-none"
      >
        <NativeSelectOption value="newest">Newest First</NativeSelectOption>
        <NativeSelectOption value="oldest">Oldest First</NativeSelectOption>
        <NativeSelectOption value="price-asc">
          Price: Low to High
        </NativeSelectOption>
        <NativeSelectOption value="price-desc">
          Price: High to Low
        </NativeSelectOption>
      </NativeSelect>
    </div>
  );
}
