"use client";

import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ProductCard } from "./product-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  name: string;
  description: string;
  price: string;
  category: string;
  id: string;
  is_favorite: boolean;
}

interface ProductListProps {
  products: Product[];
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  page: number;
  size: number;
  totalPages: number;
}

export function ProductList({
  products,
  setPage,
  setSize,
  page,
  size,
  totalPages,
}: ProductListProps) {
  const handlePageChange = (page: number) => {
    setPage(page);
  };


  const handleItemsPerPageChange = (value: string) => {
    setSize(parseInt(value));
  };
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Select onValueChange={handleItemsPerPageChange}  defaultValue={size.toString()}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per page</SelectItem>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem className="cursor-pointer">
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, page - 1))}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index} className="cursor-pointer">
                <PaginationLink
                  onClick={() => {
                    handlePageChange(index + 1);
                    setPage(index + 1);
                  }}
                  isActive={page === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem className="cursor-pointer">
              <PaginationNext
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
