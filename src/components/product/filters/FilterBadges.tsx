"use client";

import { ProductFilters } from "@/Types/filterTypes";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FilterBadgesProps {
  filters: ProductFilters;
  onRemove: (type: "brands" | "categories" | "sex", value: string) => void;
}

export function FilterBadges({ filters, onRemove }: FilterBadgesProps) {
  const allActiveFilters = [
    ...filters.brands.map((v) => ({ type: "brands" as const, value: v })),
    ...filters.categories.map((v) => ({
      type: "categories" as const,
      value: v,
    })),
    ...filters.sex.map((v) => ({ type: "sex" as const, value: v })),
  ];

  if (allActiveFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {allActiveFilters.map(({ type, value }) => (
        <Badge
          key={`${type}-${value}`}
          variant="secondary"
          className="gap-1 pr-1 text-xs rounded-none"
        >
          {value}
          <button
            onClick={() => onRemove(type, value)}
            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors cursor-pointer"
            aria-label={`Remove ${value} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
