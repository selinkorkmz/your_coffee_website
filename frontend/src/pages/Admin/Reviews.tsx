import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPendingReviews, moderateReview } from "../../lib/requests";
import { Button } from "@/components/ui/button";
import { BsClipboardCheck } from "react-icons/bs";


export default function AdminLanding() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["pendingReviews"],
    queryFn: getPendingReviews,
  });

  const { mutate: moderateReviewMutation } = useMutation({
    mutationFn: ({
      reviewId,
      approved,
    }: {
      reviewId: number;
      approved: number;
    }) => moderateReview(reviewId, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingReviews"] });
    },
  });

  console.log(data);

  return (
    <div>
      {data?.reviews?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <BsClipboardCheck className="text-primary-600 w-20 h-20" />
          <p className="text-lg font-medium text-gray-600 mt-4">
            There are no reviews waiting for approval!
          </p>

        </div>
      ) :
        (<div className="p-4 w-1/2">
          {data?.reviews?.map((review: any) => (
            <div
              className="flex flex-row items-center justify-between mb-4 p-4 gap-4 border border-gray-200 pb-4"
              key={review.review_id}
            >
              <div className="w-full">
                <p className="font-bold">
                  Rating: {review.rating || "No rating"} | Comment:
                </p>
                {review.comment || "No comment"}
              </div>
              <Button
                variant="destructive"
                onClick={() =>
                  moderateReviewMutation({
                    reviewId: review.review_id,
                    approved: -1,
                  })
                }
              >
                Reject
              </Button>
              <Button
                onClick={() =>
                  moderateReviewMutation({
                    reviewId: review.review_id,
                    approved: 1,
                  })
                }
              >
                Approve
              </Button>
            </div>
          ))}
        </div>
        )}
    </div>
  )
}
