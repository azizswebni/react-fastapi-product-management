import { useQuery } from "react-query";
import { getFavoriteProductsService } from "@/services/products/productsServices";
import { Product } from "@/lib/types";

function Favorites() {
  const { data, isLoading, isError, error } = useQuery<Product[], Error>(
    "favoriteProducts",
    getFavoriteProductsService
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-xl font-medium text-gray-700">Loading...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Error</p>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Your Favorite Products
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data?.map((product) => (
            <div
              key={product.id}
              className="relative bg-white rounded-lg shadow-lg overflow-hidden hover:scale-105 transform transition-transform duration-300"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Image Unavailable</span>
              </div>

              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {product.description}
                </p>
                <p className="text-lg font-bold text-blue-600">
                  ${parseFloat(product.price).toFixed(2)}
                </p>
              </div>

              <div className="absolute top-2 right-2">
                <button className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow hover:bg-blue-600 transition">
                  Favorite
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Favorites;
