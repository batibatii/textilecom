import { useState, useMemo, useCallback } from "react";

export type SortDirection = "asc" | "desc" | null;

interface UseTableStateOptions<T> {
  data: T[];
  itemsPerPage?: number;
  searchFields?: (keyof T)[];
}

interface UseTableStateReturn<T, K extends keyof T = keyof T> {
  paginatedData: T[];
  filteredData: T[];

  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  setCurrentPage: (page: number) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearchChange: (query: string) => void;

  sortField: K | null;
  sortDirection: SortDirection;
  handleSort: (field: K) => void;
}

export function useTableState<T, K extends keyof T = keyof T>({
  data,
  itemsPerPage = 10,
  searchFields = [],
}: UseTableStateOptions<T>): UseTableStateReturn<T, K> {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<K | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchQuery && searchFields.length > 0) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          if (typeof value === "string") {
            return value.toLowerCase().includes(query);
          }
          return false;
        })
      );
    }

    if (sortField && sortDirection) {
      result.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        // Handle date strings
        if (typeof aValue === "string" && typeof bValue === "string") {
          // Check if it's a date string (ISO format)
          if (
            aValue.match(/^\d{4}-\d{2}-\d{2}/) &&
            bValue.match(/^\d{4}-\d{2}-\d{2}/)
          ) {
            const aTime = new Date(aValue).getTime();
            const bTime = new Date(bValue).getTime();
            return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
          }
          // String comparison
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    return result;
  }, [data, searchQuery, searchFields, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleSort = useCallback(
    (field: K) => {
      if (sortField === field) {
        // Toggle direction or reset
        if (sortDirection === "asc") {
          setSortDirection("desc");
        } else if (sortDirection === "desc") {
          setSortField(null);
          setSortDirection(null);
        }
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
      setCurrentPage(1);
    },
    [sortField, sortDirection]
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  return {
    paginatedData,
    filteredData,

    currentPage,
    totalPages,
    startIndex,
    endIndex,
    setCurrentPage,

    searchQuery,
    setSearchQuery,
    handleSearchChange,

    sortField,
    sortDirection,
    handleSort,
  };
}
