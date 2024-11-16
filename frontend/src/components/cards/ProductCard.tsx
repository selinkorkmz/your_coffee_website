import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Product } from "@/types/product";
import { Link } from "react-router-dom";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>
          {product.name} {`- ${product.model}`}
        </CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      <CardContent>
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
              <span className="text-lg text-gray-500 font-bold">
                ${product.price}
              </span>
            )}
          </div>
          <div>
            {product.quantity_in_stock > 0 ? (
              <span className="text-sm text-green-500 font-bold">In Stock</span>
            ) : (
              <span className="text-sm text-red-500 font-bold">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="w-full">
        <Link to={`/products/${product.product_id}`} className="w-full">
          <Button className="w-full">View Product</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
