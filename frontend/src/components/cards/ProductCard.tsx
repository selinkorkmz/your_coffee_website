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

  const handleCartAdd = () => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      // Add to cart using the server-side mutation
      addProductToCartMutation({
        productId: product.product_id,
        quantity: 1,
      });
    } else {
      // Handle the cart in localStorage
      const localCart: any[] = JSON.parse(localStorage.getItem("cart") || "[]");

      // Check if the product already exists in the cart
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
              product.image_url ||
              (product.category === "Coffee"
                ? "https://upload.wikimedia.org/wikipedia/commons/c/c5/Roasted_coffee_beans.jpg" // Replace with your coffee image URL
                : product.category === "Coffee Machines"
                  ? "https://assets.bonappetit.com/photos/61e755ce6b6fe523b0365397/16:9/w_1280,c_limit/20220112%20Best%20Coffee%20Maker%20LEDE.jpg" // Replace with your coffee machines image URL
                  : product.category === "Drinks"
                    ? "https://assets.bonappetit.com/photos/620fc9f986a3bcc597572d1c/3:2/w_6507,h_4338,c_limit/20220215%20Coffee%20Alternatives%20LEDE.jpg" // Replace with your drinks image URL
                    : product.category === "Accessories"
                      ? "https://img.freepik.com/free-photo/still-life-coffee-tools_23-2149371282.jpg" // Replace with your accessories image URL
                      : "https://upload.wikimedia.org/wikipedia/commons/c/c5/Roasted_coffee_beans.jpg" // Default fallback image
              )
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
