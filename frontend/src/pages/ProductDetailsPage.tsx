import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Product } from "@/types/product"; // You'll need to create this type
import { Review } from "@/types/review";
import { Button } from "@/components/ui/button";
import { FaRegStar, FaStarHalfAlt, FaStar } from "react-icons/fa";
import { getProductById, addProductToCart, getReviews, addToWishlist } from "@/lib/requests";
import { useQuery, useMutation } from "@tanstack/react-query";

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((index) => {
        const difference = rating - index;

        return (
          <span key={index}>
            {difference >= 0 ? (
              <FaStar className="h-5 w-5 text-yellow-400" />
            ) : difference > -1 ? (
              <FaStarHalfAlt className="h-5 w-5 text-yellow-400" />
            ) : (
              <FaRegStar className="h-5 w-5 text-gray-200" />
            )}
          </span>
        );
      })}
    </div>
  );
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalRating, setTotalRating] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: productData, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => getReviews(Number(id)),
  });

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
        alert(data.message);
      }
    },
  });

  // Add to Wishlist Mutation
  const { mutate: addToWishlistMutation } = useMutation({
    mutationFn: ({ userId, productId }: { userId: number; productId: number }) =>
      addToWishlist(userId, productId),
    onSuccess: (data: any) => {
      if (data.success) {
        alert("Added to wishlist!");
      } else {
        alert(data.message || "Failed to add to wishlist.");
      }
    },
  });

  useEffect(() => {
    setReviews(reviewsData?.reviews ?? []);
    setProduct(productData?.product);

    const ratings =
      reviewsData?.reviews.filter((review: Review) => review.rating !== null) ||
      [];

    const totalRating = ratings?.reduce(
      (acc: number, review: Review) => acc + review.rating,
      0
    );

    const averageRating = totalRating / ratings.length;
    setTotalRating(averageRating ? Number(averageRating.toFixed(1)) : 0);
  }, [id, navigate, productData, reviewsData]);

  const addToCart = () => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      addProductToCartMutation({
        productId: product!.product_id,
        quantity,
      });
    } else {
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingProductIndex = localCart.findIndex(
        (item) => item.productId === product!.product_id
      );
      const stock = product!.quantity_in_stock;

      if (existingProductIndex !== -1) {
        const quantityInCart = localCart[existingProductIndex].quantity;
        if (stock < quantityInCart + quantity) {
          alert("Total quantity exceeds the available stock.");
          return;
        } else {
          localCart[existingProductIndex].quantity += quantity;
          alert("Added to cart");
        }
      } else {
        if (stock < quantity) {
          alert("Total quantity exceeds the available stock.");
          return;
        } else {
          localCart.push({
            productId: product!.product_id,
            quantity: quantity,
          });
          alert("Added to cart");
        }
      }

      localStorage.setItem("cart", JSON.stringify(localCart));
    }
  };

  const addToWishlistHandler = () => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const userId = JSON.parse(savedUser).user_id;
      addToWishlistMutation({ userId, productId: product!.product_id });
    } else {
      alert("You need to log in to add products to your wishlist.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!productData || !product) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square rounded-lg overflow-hidden">
          <img
            src={
              productData.product.image_url ??
              "https://upload.wikimedia.org/wikipedia/commons/c/c5/Roasted_coffee_beans.jpg"
            }
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">
            {product.name}{" "}
            <span className="text-sm text-gray-500">
              {totalRating.toFixed(1) || 0}/5
            </span>
          </h1>
          <p className="text-gray-600">{product.description}</p>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-2 mt-4">
              <div className="flex items-center gap-2">
                {product.discounted_price ? (
                  <>
                    <span className="text-3xl text-black font-semibold">
                      ${product.discounted_price.toFixed(2)}
                    </span>
                    <span className="text-3xl text-gray-500 line-through">
                      ${product.price}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl text-black font-semibold">
                    ${product.price}
                  </span>
                )}
              </div>
              <div>
                {product.quantity_in_stock > 0 ? (
                  <span className="text-3xl text-green-500 font-bold">
                    In Stock
                  </span>
                ) : (
                  <span className="text-3xl text-red-500 font-bold">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Product Details</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Product Id: {product.product_id}</li>
              <li>Category: {product.category}</li>
              <li>Model: {product.model}</li>
              <li>Serial Number: {product.serial_number}</li>
              {product.origin && <li>Origin: {product.origin}</li>}
              {product.roast_level && <li>Roast Level: {product.roast_level}</li>}
              {product.power_usage && <li>Power Usage: {product.power_usage}</li>}
              {product.warranty_status && <li>Warranty Status: {product.warranty_status}</li>}
              {product.distributor_info && (
                <li>Distributer: {product.distributor_info}</li>
              )}
            </ul>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => {
                if (quantity > 1) {
                  setQuantity(quantity - 1);
                }
              }}
            >
              -
            </Button>
            <span className="text-xl font-bold w-10 text-center">
              {quantity}
            </span>

            <Button
              onClick={() => {
                if (quantity < product.quantity_in_stock) {
                  setQuantity(quantity + 1);
                }
              }}
            >
              +
            </Button>
          </div>

          <div className="flex gap-4">
            <Button
              className=""
              onClick={addToCart}
              disabled={product.quantity_in_stock === 0}
            >
              {product.quantity_in_stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>

            {/* Add to Wishlist Button */}
            <Button
              className=""
              onClick={addToWishlistHandler}
            >
              Add to Wishlist
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>

          <div className="mb-8">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold">{totalRating}</span>
              <div>
                <RatingStars rating={totalRating} />
                <p className="text-sm text-gray-500 mt-1">
                  Based on {reviews.length} reviews
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {reviews
              .slice()
              .reverse()
              .filter((review) => review.comment !== null)
              .map((review) => (
                <div key={review.review_id} className="border-b pb-8">
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <p className="font-semibold">{review.name}</p>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
          </div>

          {reviews.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No reviews yet. Be the first to review this product!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
