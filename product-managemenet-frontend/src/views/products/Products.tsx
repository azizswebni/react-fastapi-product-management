import { getProductsService } from "@/services/products/productsServices";
import { useQuery } from "react-query";
import { ProductList } from "@/components/product-list";
import { useEffect, useState } from "react";

function Products() {
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(5);
  const {
    data: paginated_products_data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["paginated_products_data"],
    queryFn: () => getProductsService(page, size),
  });
  useEffect(() => {
    refetch();
  }, [page, size, refetch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <div className="h-full w-full p-10">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Product Showcase</h1>
        <ProductList
          products={paginated_products_data.items}
          totalPages={paginated_products_data?.pages}
          setPage={setPage}
          setSize={setSize}
          refetch={refetch}
          size={size}
          page={page}
        />
      </div>
    </div>
  );
}

export default Products;
