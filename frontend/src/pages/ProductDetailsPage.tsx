import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Product } from "@/types/product"; // You'll need to create this type
import { Review } from "@/types/review";
import { Button } from "@/components/ui/button";
import { FaRegStar, FaStarHalfAlt, FaStar } from "react-icons/fa";
import { Textarea } from "@/components/ui/textarea";
import {
  getProductById,
  addProductToCart,
  submitReview,
  getReviews,
} from "@/lib/requests";
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

const RatingInput = ({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (rating: number) => void;
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((index) => (
        <div
          key={index}
          className="relative"
          onMouseEnter={() => setHoverRating(index)}
          onMouseLeave={() => setHoverRating(0)}
        >
          {/* Left half */}
          <span
            className="cursor-pointer absolute left-0 w-1/2 h-full z-10"
            onClick={() => setRating(index - 0.5)}
          />
          {/* Right half */}
          <span
            className="cursor-pointer absolute right-0 w-1/2 h-full z-10"
            onClick={() => setRating(index)}
          />
          {/* Star icon */}
          {(hoverRating || rating) - index >= 0 ? (
            <FaStar className="h-8 w-8 text-yellow-400" />
          ) : (hoverRating || rating) - index > -1 ? (
            <FaStarHalfAlt className="h-8 w-8 text-yellow-400" />
          ) : (
            <FaRegStar className="h-8 w-8 text-yellow-400" />
          )}
        </div>
      ))}
      <span className="ml-2 text-sm text-gray-500">
        {rating ? `${rating} stars` : "Select rating"}
      </span>
    </div>
  );
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
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
    }) => addProductToCart(productId, quantity),
    onSuccess: () => {
      alert("added to cart");
    },
  });

  const { mutate: submitReviewMutation, isPending: isSubmittingReview } =
    useMutation({
      mutationFn: ({
        productId,
        comment,
        rating,
      }: {
        productId: number;
        comment: string;
        rating: number;
      }) => submitReview(productId, comment, rating),
      onSuccess: () => {
        alert("Review submitted successfully");
      },
    });

  useEffect(() => {
    setReviews(reviewsData?.reviews ?? []);
    setProduct(productData?.product);

    const totalRating = reviewsData?.reviews.reduce(
      (acc: number, review: Review) => acc + review.rating,
      0
    );
    const averageRating = totalRating / reviewsData?.reviews.length;
    setTotalRating(averageRating ? Number(averageRating.toFixed(1)) : 0);
  }, [id, navigate, productData, reviewsData]);

  const addToCart = () => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      // Add to cart using the server-side mutation
      addProductToCartMutation({
        productId: product!.product_id,
        quantity: 1,
      });
    } else {
      // Handle the cart in localStorage
      const localCart: any[] = JSON.parse(localStorage.getItem("cart") || "[]");

      // Check if the product already exists in the cart
      const existingProductIndex = localCart.findIndex(
        (item) => item.productId === product!.product_id
      );

      if (existingProductIndex !== -1) {
        localCart[existingProductIndex].quantity += 1;
      } else {
        localCart.push({
          productId: product!.product_id,
          quantity: 1,
        });
      }
      localStorage.setItem("cart", JSON.stringify(localCart));


      alert("added to cart");

    }
  } 

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
            <span className="text-sm text-gray-500">{totalRating || 0}/5</span>
          </h1>
          <p className="text-gray-600">{product.description}</p>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-2 mt-4">
              <div className="flex items-center gap-2">
                {product.discounted_price ? (
                  <>
                    <span className="text-3xl text-black font-semibold">
                      ${product.discounted_price}
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
              <li>Category: {product.category}</li>
              <li>Model: {product.model}</li>
              <li>Serial Number: {product.serial_number}</li>
              {product.origin && <li>Origin: {product.origin}</li>}
              {product.roast_level && (
                <li>Roast Level: {product.roast_level}</li>
              )}
              {product.power_usage && (
                <li>Power Usage: {product.power_usage}</li>
              )}
              {product.warranty_status && (
                <li>Warranty Status: {product.warranty_status}</li>
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

          <Button
            className=""
            onClick={addToCart}
            disabled={product.quantity_in_stock === 0}
          >
            {product.quantity_in_stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>

          {/* Reviews Summary */}
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

          {/* Write a Review Button */}
          <div className="flex flex-col gap-4">
            <RatingInput rating={rating} setRating={setRating} />
            <Textarea
              rows={4}
              placeholder="Write your review here..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <Button
              className="mb-8"
              onClick={() => {
                submitReviewMutation({
                  productId: product.product_id,
                  comment: reviewText,
                  rating,
                });
              }}
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? "Submitting..." : "Write a Review"}
            </Button>
          </div>

          {/* Reviews List */}
          <div className="space-y-8">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">{review.userName}</p>
                    <div className="flex items-center gap-2">
                      <RatingStars rating={review.rating} />
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>

          {/* No Reviews Message */}
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
