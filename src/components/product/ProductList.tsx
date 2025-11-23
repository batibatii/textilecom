"use client";

import { useState } from "react";
import { Product } from "@/types/productValidation";
import { AdminProductCard } from "@/components/product/AdminProductCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter } from "next/navigation";

interface ProductListProps {
  products: Product[];
  showMoveToDraft?: boolean;
}

export function ProductList({ products, showMoveToDraft = false }: ProductListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const productsPerPage = 12;

  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleProductUpdate = () => {
    router.refresh();
  };

  const renderPagination = () => (
    <Pagination className="flex justify-end sm:pr-10 md:pr-0 md:justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={handlePrevious}
            className={
              currentPage === 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
        {getPageNumbers().map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => setCurrentPage(page)}
              isActive={currentPage === page}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={handleNext}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  return (
    <>
      {totalPages > 1 && <div className="mb-5">{renderPagination()}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-20   ">
        {currentProducts.map((product, index) => (
          <AdminProductCard
            key={product.id}
            product={product}
            onDelete={handleProductUpdate}
            onUpdate={handleProductUpdate}
            priority={index < 4}
            showMoveToDraft={showMoveToDraft}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-5 lg:hidden">{renderPagination()}</div>
      )}
    </>
  );
}
