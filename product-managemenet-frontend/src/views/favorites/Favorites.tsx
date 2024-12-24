import { useQuery } from "react-query";
import { getFavoriteProductsService } from "@/services/products/productsServices";
import { Product } from "@/lib/types";

const baseURL = import.meta.env.VITE_API_URL;

function Favorites() {
  const { data, isLoading, isError, error } = useQuery<Product[], Error>(
    "favoriteProducts",
    getFavoriteProductsService
  );

  if (isLoading) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        <span className="relative inline-block w-12 h-12 rounded-full text-white rotate-45 perspective-1000 before:content-[''] before:block before:absolute before:inset-0 before:w-full before:h-full before:rounded-full before:rotate-x-70 before:animate-spin after:content-[''] after:block after:absolute after:inset-0 after:w-full after:h-full after:rounded-full after:rotate-y-70 after:text-red-500 after:animate-spin after:animation-delay-400ms"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen ">
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
              <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                {product.image_url && (
                  <img
                    src={`${baseURL}/products${product.image_url}`}
                    alt={product.name || "Image Unavailable"}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                  <h2 className="text-lg font-semibold text-white text-center">
                    {product.name}
                  </h2>
                </div>
              </div>

              <div className="p-4">
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
        {data?.length === 0 && (
          <div className="text-center text-gray-600">
            No products in favorites.
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;
