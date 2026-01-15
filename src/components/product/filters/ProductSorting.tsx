"use client";

import { SortOption } from "@/Types/filterTypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ProductSortingProps {
  sortBy: SortOption;
  onChange: (sort: SortOption) => void;
}

export function ProductSorting({ sortBy, onChange }: ProductSortingProps) {
  return (
    <div className="space-y-3 p-4 border rounded-none">
      <Label htmlFor="product-sort" className="font-semibold text-sm">Sort By</Label>
      <Select value={sortBy} onValueChange={onChange}>
        <SelectTrigger className="w-full h-9 text-sm">
          <SelectValue placeholder="Select sort order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
