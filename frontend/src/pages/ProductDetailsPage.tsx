import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { DATA, REVIEWS } from "@/lib/data";
import { Product } from "@/types/product"; // You'll need to create this type
import { Review } from "@/types/review";
import { Button } from "@/components/ui/button";
import { FaRegStar, FaStarHalfAlt, FaStar } from "react-icons/fa";
import { Textarea } from "@/components/ui/textarea";
import { addProductToCart } from "@/lib/requests";

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
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [quantity, setQuantity] = useState(1);
  useEffect(() => {
    // Find the product with matching id
    const foundProduct = DATA.find((p) => p.id === Number(id));

    if (!foundProduct) {
      navigate("/products"); // Redirect if product not found
      return;
    }

    setProduct(foundProduct);
    setLoading(false);

    // Fetch reviews (replace with your actual data fetching logic)
    setReviews(REVIEWS);
  }, [id, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">
            {product.name}{" "}
            <span className="text-sm text-gray-500">{product.rating}/5</span>
          </h1>
          <p className="text-gray-600">{product.description}</p>

          <div className="mt-4">
            <span className="text-2xl font-semibold">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Product Details</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Category: {product.category}</li>
              <li>Subcategory: {product.subCategory}</li>
              {/* Add more product details as needed */}
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

            <Button onClick={() => setQuantity(quantity + 1)}>+</Button>
          </div>

          <Button
            className=""
            onClick={() => {
              // Add to cart functionality here
              if (!localStorage.getItem("user")) {
                const cartStr = localStorage.getItem("cart")
                const cart: any[] = JSON.parse(cartStr ?? "[]")

                const productIndexInCart = cart.findIndex((item) => item.productId === product.id);

                if(productIndexInCart !== -1) {
                  cart[productIndexInCart].quantity += quantity;
                } else {
                  cart.push({
                    productId: product.id,
                    quantity
                  })
                }

                
                
                localStorage.setItem("cart", JSON.stringify(cart));
              } else {
                addProductToCart(product.id, quantity)
              }
              alert("Product added to cart!")
              console.log("Add to cart:", product.id);
            }}
          >
            Add to Cart
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
              <span className="text-4xl font-bold">
                {product.rating.toFixed(1)}
              </span>
              <div>
                <RatingStars rating={product.rating} />
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
            <Button className="mb-8">Write a Review</Button>
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
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
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
