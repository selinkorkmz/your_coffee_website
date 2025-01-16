import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { addProductToCart, getReviews, removeFromWishlist } from "@/lib/requests";
import { Product } from "@/types/product";
import { Review } from "@/types/review";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { addToWishlist } from "@/lib/requests";
import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(Boolean(product.wishlist_id));
  const { mutate: addProductToCartMutation } = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: number;
      quantity: number;
    }) => {
      const result = addProductToCart(productId, quantity);
      return result; // Ensure the return value is passed to ⁠ onSuccess ⁠
    },
    onSuccess: (data: any) => {
      if (data.success) {
        alert("added to cart");
      } else {
        alert(data.message)
      }
    },
  });

  const { mutate: addToWishlistMutation } = useMutation({
    mutationFn: ({ userId, productId }: { userId: number; productId: number }) =>
      addToWishlist(userId, productId),
    onSuccess: (data: any) => {
      if (data.success) {
        alert("Added to wishlist");
      } else {
        alert(data.message);
      }
    },
  });

  const { mutate: removeFromWishlistMutation } = useMutation({
    mutationFn: ({ userId, productId }: { userId: number; productId: number }) =>
      removeFromWishlist(userId, productId),
    onSuccess: (data: any) => {
      if (data.success) {
        alert("Removed from wishlist");
      } else {
        alert(data.message);
      }
    },
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", product.product_id],
    queryFn: () => getReviews(product.product_id),
  });

  const handleCartAdd = () => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      // If the user is logged in, call the backend mutation
      addProductToCartMutation({
        productId: product.product_id,
        quantity: 1,
      });
    } else {
      // Handle local cart for guest users
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingProductIndex = localCart.findIndex(
        (item) => item.productId === product.product_id
      );
      const stock = product.quantity_in_stock;

      if (existingProductIndex !== -1) {
        // Product exists in cart
        const quantityInCart = localCart[existingProductIndex].quantity;
        if (stock < quantityInCart + 1) {
          alert("Total quantity exceeds the available stock.");
          return;
        } else {
          localCart[existingProductIndex].quantity += 1;
          alert("Added to cart");
        }
      } else {
        // Product does not exist in cart
        if (stock < 1) {
          alert("Total quantity exceeds the available stock.");
          return;
        } else {
          localCart.push({
            productId: product.product_id,
            quantity: 1,
          });
          alert("Added to cart");
        }
      }

      // Update the cart in localStorage
      localStorage.setItem("cart", JSON.stringify(localCart));
    }
  };


  const handleWishlistAdd = () => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const userId = JSON.parse(savedUser).user_id;
      addToWishlistMutation({ userId, productId: product.product_id });
    } else {
      alert("You need to log in to add products to your wishlist.");
    }
  };

  const handleWishlistRemove = () => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const userId = JSON.parse(savedUser).user_id;
      removeFromWishlistMutation({ userId, productId: product.product_id });
    } else {
      alert("You need to log in to add products to your wishlist.");
    }
  };

  const ratings =
    reviewsData?.reviews.filter((review: Review) => review.rating !== null) ||
    [];

  const totalRating = ratings?.reduce(
    (acc: number, review: Review) => acc + review.rating,
    0
  );

  const averageRating = totalRating / ratings.length || 0;






  const toggleWishlist = () => {
    if (isInWishlist) {
      handleWishlistRemove()
    } else {
      handleWishlistAdd()
    }
    setIsInWishlist((prev) => !prev);
    
  };

  return (
    <Card className="w-[350px] flex flex-col">
      <Link to={`/products/${product.product_id}`} className="w-full">
        <CardHeader className="h-[120px]">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <CardTitle>{product.name}</CardTitle>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">
                  {averageRating.toFixed(1)}/5
                </span>
              </div>
            </div>
            <CardDescription className="mt-2 line-clamp-2">
              {product.description}
            </CardDescription>
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
                    ${product.discounted_price.toFixed(2)}
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
      <CardFooter className="w-full mt-auto flex justify-between items-center">
        <Button
          className="w-[80%] h-full bg-yellow-950  hover:bg-yellow-700"
          onClick={handleCartAdd}
          disabled={product.quantity_in_stock === 0}
        >
          {product.quantity_in_stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
        <button
          className="text-xl text-red-500 bg-white h-full items-center justify-center focus:outline-none active:outline-none"
          style={{
            width: '20%',
            border: 'none',
            outline: 'none',
          }}
          onClick={toggleWishlist}
          onMouseDown={(e) => e.preventDefault()} // Prevents focus
        >
          {isInWishlist ? <FaHeart /> : <FaRegHeart />}
        </button>
      </CardFooter>

    </Card>
  );
}


