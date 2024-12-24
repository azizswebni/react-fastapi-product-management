import { Heart, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster } from "./ui/toaster";
import { useState } from "react";
import {
  addFavoriteService,
  deleteFavoriteService,
  deleteProductService,
} from "@/services/products/productsServices";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "react-query";
import { useAuthStore } from "@/store/auth.store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UpdateProduct } from "./update-product-dialog/updateProduct";

interface ProductCardProps {
  id: string;
  category: string;
  description: string;
  is_favorite: boolean;
  name: string;
  price: string;
  refetch: () => void;
}

export function ProductCard({
  id,
  category,
  description,
  is_favorite,
  name,
  price,
  refetch,
}: ProductCardProps) {
  const [favorite, setFavorite] = useState(is_favorite);
  const { isAdmin } = useAuthStore();
  const { toast } = useToast();

  const addFavoriteMutation = useMutation(() => addFavoriteService(id), {
    onSuccess: () => {
      setFavorite(true);
      toast({
        title: "Product added to favorite successfully !",
      });
    },
    onError: (error_message: string) => {
      toast({
        title: error_message,
      });
    },
  });

  const deleteProductMutation = useMutation(() => deleteProductService(id), {
    onSuccess: () => {
      toast({
        title: "Product deleted successfully !",
      });
      refetch();
    },
    onError: (error_message: string) => {
      toast({
        title: error_message,
      });
    },
  });

  const deleteFavoriteMutation = useMutation(() => deleteFavoriteService(id), {
    onSuccess: () => {
      setFavorite(false);
      toast({
        title: "Product removed from favorite successfully !",
      });
    },
    onError: (error_message: string) => {
      toast({
        title: error_message,
      });
    },
  });

  const handleFavoriteClick = () => {
    if (!favorite) {
      addFavoriteMutation.mutate();
    } else {
      deleteFavoriteMutation.mutate();
    }
  };

  const confirmDelete = () => {
    deleteProductMutation.mutate();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-xl">{name}</CardTitle>
            <CardDescription>{description}</CardDescription>
            <Badge variant="secondary">{category}</Badge>
          </div>
          <Button
            variant="outline"
            size="icon"
            className={favorite ? "text-red-500" : "text-gray-500"}
            onClick={handleFavoriteClick}
          >
            <Heart className="h-4 w-4 " fill={favorite ? "red" : "none"} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2 flex justify-between items-center">
          <p className="text-2xl font-bold">${price}</p>

          <div className="flex justify-center items-center gap-2">
            {isAdmin && (
              <UpdateProduct
                refetch={refetch}
                id={id}
                category={category}
                description={description}
                name={name}
                price={parseInt(price)}
              />
            )}
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      this product and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
      <Toaster />
    </Card>
  );
}
