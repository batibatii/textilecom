"use client";

import { useState, useEffect } from "react";
import { ProductFilters } from "@/Types/filterTypes";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ProductFilters as ProductFiltersComponent } from "./ProductFilters";

interface MobileFilterDrawerProps {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
  availableValues: {
    brands: string[];
    categories: string[];
    sex: string[];
  };
  children: React.ReactNode;
}

export function MobileFilterDrawer({
  filters,
  onChange,
  availableValues,
  children,
}: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onChange(tempFilters);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempFilters(filters);
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          <ProductFiltersComponent
            filters={tempFilters}
            onChange={setTempFilters}
            availableValues={availableValues}
          />
        </div>
        <div className="p-4 border-t flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 rounded-none"
          >
            CANCEL
          </Button>
          <Button onClick={handleApply} className="flex-1 rounded-none">
            APPLY FILTERS
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
