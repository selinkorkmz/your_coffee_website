import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { addProductToCart } from "@/lib/requests";
import { Product } from "@/types/product";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {

  const { mutate: addProductToCartMutation } = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: number;
      quantity: number;
    }) => addProductToCart(productId, quantity),
    onSuccess: () => {
      alert("added to cart");
    },
  });

  
  return (
    <Card className="w-[350px] flex flex-col">
  <Link to={`/products/${product.product_id}`} className="w-full">
    <CardHeader className="h-[120px]">
      <div className="flex flex-col">
        <CardTitle>{product.name}</CardTitle>
        <CardDescription className="mt-2 line-clamp-2">
          {product.description}
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <img
        src={
          product.image_url ??
          "https://fastly.picsum.photos/id/503/200/300.jpg?hmac=NvjgwV94HmYqnTok1qtlPsDxdf197x8fsWy5yheKlGg"
        }
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="flex items-center justify-between gap-2 mt-4">
        <div className="flex items-center gap-2">
          {product.discounted_price ? (
            <>
              <span className="text-lg text-black font-bold">
                ${product.discounted_price}
              </span>
              <span className="text-lg text-gray-500 line-through">
                ${product.price}
              </span>
            </>
          ) : (
            <span className="text-lg text-black font-bold">
              ${product.price}
            </span>
          )}
        </div>
        <div>
          {product.quantity_in_stock > 0 ? (
            <span className="text-sm text-green-500 font-bold">
              Stock: {product.quantity_in_stock}
            </span>
          ) : (
            <span className="text-sm text-red-500 font-bold">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </CardContent>
  </Link>
  <CardFooter className="w-full mt-auto">
    <Button
      className="w-full"
      onClick={() => {
        addProductToCartMutation({
          productId: product.product_id,
          quantity: 1,
        });
      }}
      disabled={product.quantity_in_stock === 0}
    >
      {product.quantity_in_stock === 0 ? "Out of Stock" : "Add to Cart"}
    </Button>
  </CardFooter>
</Card>


  
  );
}
