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
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </CardContent>
      <CardFooter className="w-full">
        <Link to={`/products/${product.id}`} className="w-full">
          <Button className="w-full">View Product</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
