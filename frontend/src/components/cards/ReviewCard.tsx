import { useState } from "react";
import { FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { submitReview, submitRating } from "@/lib/requests";
import { Product } from "@/types/product";

const ReviewCard = ({ product }: { product: Product & {rating?: number, comment?: string, comment_approved?: number} }) => {
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");

  const { mutate: submitReviewMutation, isPending: isSubmittingReview } =
    useMutation({
      mutationFn: ({
        productId,
        comment,
        rating
      }: {
        productId: number;
        comment: string;
        rating: number
      }) => submitReview(productId, comment, rating),
      onSuccess: () => {
        alert("Review submitted successfully");
        setReviewText(""); // Clear the text area
        setRating(0); // Reset the rating
      },
    });

    if (product.rating || product.comment) {
      return (<div className="flex flex-col gap-4 w-[50%]">
        {product.rating && <div><span className="font-bold">Your Rating:</span> {product.rating}</div>}
        {product.comment && <div className="flex flex-col"><span className="font-bold">Your Comment:</span> {product.comment}</div>}
        <div
  className={`flex flex-col font-bold ${
    product.comment_approved === 1
      ? "text-green-500"
      : product.comment_approved === -1
      ? "text-red-500"
      : "text-yellow-500"
  }`}
>
  {product.comment_approved === 1
    ? "Review Approved"
    : product.comment_approved === -1
    ? "Review Rejected"
    : "Review Waiting Approval"}
</div>
      </div>)
    }

  return (<div className="flex flex-col gap-4">
      <RatingInput
        rating={rating}
        setRating={setRating}
        productId={product.product_id}
      />
      <Textarea
        rows={4}
        placeholder="Write your review here..."
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
      />
      <Button
        className="mb-8"
        onClick={() => {
          if(!rating) {
            alert("You cannot add review without a rating")
            return;
          }

          if(!reviewText) {
            alert("You cannot add review without a comment")
            return;
          }

          submitReviewMutation({
            productId: product.product_id,
            comment: reviewText,
            rating
          });
        }}
        disabled={isSubmittingReview}
      >
        {isSubmittingReview ? "Submitting..." : "Write a Review"}
      </Button>
    </div>
  );
};

const RatingInput = ({
  rating,
  setRating,
  productId,
}: {
  rating: number;
  setRating: (rating: number) => void;
  productId: number;
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const { mutate: submitRatingMutation } = useMutation({
    mutationFn: ({
      productId,
      rating,
    }: {
      productId: number;
      rating: number;
    }) => submitRating(productId, rating),
    onSuccess: () => {
      alert("Rating submitted successfully");
    },
  });

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
        {rating ? (
          <Button onClick={() => submitRatingMutation({ productId, rating })}>
            Submit Rating ({rating})
          </Button>
        ) : (
          "Select rating"
        )}
      </span>
    </div>
  );
};

export default ReviewCard;
