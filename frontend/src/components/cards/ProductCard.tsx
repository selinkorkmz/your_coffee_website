import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { addProductToCart, getReviews } from "@/lib/requests";
import { Product } from "@/types/product";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

type ProductCardProps = {
  product: Product;
};

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((index) => {
        const difference = rating - index;

        return (
          <span key={index}>
            {difference >= 0 ? (
              <FaStar className="h-4 w-4 text-yellow-400" />
            ) : difference > -1 ? (
              <FaStarHalfAlt className="h-4 w-4 text-yellow-400" />
            ) : (
              <FaRegStar className="h-4 w-4 text-gray-200" />
            )}
          </span>
        );
      })}
    </div>
  );
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

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["reviews", product.product_id],
    queryFn: () => getReviews(product.product_id),
  });

  const handleCartAdd = () => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      addProductToCartMutation({
        productId: product.product_id,
        quantity: 1,
      });
    } else {
      const localCart: any[] = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingProductIndex = localCart.findIndex(
        (item) => item.productId === product.product_id
      );

      if (existingProductIndex !== -1) {
        localCart[existingProductIndex].quantity += 1;
      } else {
        localCart.push({
          productId: product.product_id,
          quantity: 1,
        });
      }
      localStorage.setItem("cart", JSON.stringify(localCart));
      alert("added to cart");
    }
  };

  const averageRating =
    reviewsData?.reviews.reduce(
      (acc: number, review: { rating: number }) => acc + review.rating,
      0
    ) / reviewsData?.reviews.length || 0;

  return (
    <Card className="w-[350px] flex flex-col">
      <Link to={`/products/${product.product_id}`} className="w-full">
        <CardHeader className="h-[120px]">
          <div className="flex flex-col">
            {/* Horizontal row for name and rating */}
            <div className="flex items-center justify-between">
              <CardTitle>{product.name}</CardTitle>
              {/* Average Rating */}
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">{averageRating.toFixed(1)}/5</span>
              </div>
            </div>
            <CardDescription className="mt-2 line-clamp-2">{product.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <img
            src={
              product.image_url ||
              (product.category === "Coffee"
                ? "https://upload.wikimedia.org/wikipedia/commons/c/c5/Roasted_coffee_beans.jpg"
                : product.category === "Coffee Machines"
                  ? "https://assets.bonappetit.com/photos/61e755ce6b6fe523b0365397/16:9/w_1280,c_limit/20220112%20Best%20Coffee%20Maker%20LEDE.jpg"
                  : product.category === "Drinks"
                    ? "https://assets.bonappetit.com/photos/620fc9f986a3bcc597572d1c/3:2/w_6507,h_4338,c_limit/20220215%20Coffee%20Alternatives%20LEDE.jpg"
                    : product.category === "Accessories"
                      ? "https://img.freepik.com/free-photo/still-life-coffee-tools_23-2149371282.jpg"
                      : "https://upload.wikimedia.org/wikipedia/commons/c/c5/Roasted_coffee_beans.jpg")
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
          onClick={handleCartAdd}
          disabled={product.quantity_in_stock === 0}
        >
          {product.quantity_in_stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}
