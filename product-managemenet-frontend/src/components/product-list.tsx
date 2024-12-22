"use client";

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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Product } from "@/lib/types";



interface ProductListProps {
  products: Product[];
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  page: number;
  size: number;
  totalPages: number;
  setDebouncedSearchValue: (name: string) => void;
  option: string;
  setOptions: (option: string) => void;
}

export function ProductList({
  products,
  setPage,
  setSize,
  page,
  size,
  totalPages,
  setDebouncedSearchValue,
  option,
  setOptions,
}: ProductListProps) {
  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setSize(parseInt(value));
    setPage(1)
  };
  return (
    <div>
      <div className="flex gap-5 flex-wrap">
        <div className="flex flex-col w-[1000px]">
          <Label> Search Products </Label>
          <Input
            placeholder="Search product"
            onChange={(e) => setDebouncedSearchValue(e.target.value)}
          />
        </div>
        <div className="flex flex-col mb-4">
          <Label> Filter Options </Label>
          <Select
            defaultValue={option}
            onValueChange={(value: string) => setOptions(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="name">name</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="min_price">Min Price</SelectItem>
                <SelectItem value="max_price">Max Price</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col mb-4">
          <Label> Select item per page </Label>
          <Select
            onValueChange={handleItemsPerPageChange}
            defaultValue={size.toString()}
          >
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
