import { getProductsService } from "@/services/products/productsServices";
import { useQuery } from "react-query";
import { ProductList } from "@/components/product-list";
import { useEffect, useState } from "react";
import { useDebounceValue, useSessionStorage } from "usehooks-ts";
import { useAuthStore } from "@/store/auth.store";
import { AddProduct } from "@/components/add-product-dialog/addProduct";
import { PaginatedProductData } from "@/lib/types";

function Products() {
  const [page, setPage] = useSessionStorage("page", 1);
  const [size, setSize] = useSessionStorage("size", 5);
  const [option, setOptions] = useState<string>("name");
  const { isAdmin } = useAuthStore();
  const [debouncedSearchValue, setDebouncedSearchValue] = useDebounceValue(
    "",
    500
  );
  const {
    data: paginated_products_data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["paginated_products_data"],
    queryFn: () => getProductsService(page, size, debouncedSearchValue, option),
    onSuccess: (data: PaginatedProductData) => {
      if (data.pages < page) {
        setPage(data.pages);
      }
    },
  });
  useEffect(() => {
    refetch();
  }, [page, size, option, debouncedSearchValue, refetch]);

  if (isLoading)
    return (
      <div className="h-full w-full flex justify-center items-center">
        <span className="relative inline-block w-12 h-12 rounded-full text-white rotate-45 perspective-1000 before:content-[''] before:block before:absolute before:inset-0 before:w-full before:h-full before:rounded-full before:rotate-x-70 before:animate-spin after:content-[''] after:block after:absolute after:inset-0 after:w-full after:h-full after:rounded-full after:rotate-y-70 after:text-red-500 after:animate-spin after:animation-delay-400ms"></span>
      </div>
    );

  if (error)
    return (
      <div className="h-full w-full flex justify-center items-center">
        Error loading products
      </div>
    );

  return (
    <div className="h-full w-full p-10">
      <div className="container mx-auto p-4">
        <div className="flex flex-row justify-between">
          <h1 className="text-2xl font-bold mb-4">Product Showcase</h1>
          {isAdmin && <AddProduct refetch={refetch} />}
        </div>
        {paginated_products_data && (
          <ProductList
            products={paginated_products_data.items}
            totalPages={paginated_products_data?.pages}
            setPage={setPage}
            setSize={setSize}
            setDebouncedSearchValue={setDebouncedSearchValue}
            size={size}
            page={page}
            option={option}
            setOptions={setOptions}
          />
        )}
      </div>
    </div>
  );
}

export default Products;
