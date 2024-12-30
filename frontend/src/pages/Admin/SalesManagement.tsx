import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRefundRequests, updateRefundRequest } from "../../lib/requests";
import { Button } from "@/components/ui/button";
import { BsClipboardCheck } from "react-icons/bs";
import { toast } from "react-toastify";

export default function AdminLanding() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["refundRequests"],
    queryFn: getRefundRequests,
  });

  const { mutate: moderateReviewMutation, isPending } = useMutation({
    mutationFn: ({ itemId, approve }: { itemId: number; approve: boolean }) =>
      updateRefundRequest(itemId, approve),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refundRequests"] });
      toast.success("Refund request updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div>
      {data?.refunds?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <BsClipboardCheck className="text-primary-600 w-20 h-20" />
          <p className="text-lg font-medium text-gray-600 mt-4">
            There are no refund requests waiting for approval!
          </p>
        </div>
      ) : (
        <div className="p-4 w-full">
          {data?.refunds?.map((refund: any) => (
            <div
              className="flex flex-col items-center justify-between mb-4 p-4 gap-4 border border-gray-200 pb-4"
              key={refund.order_id}
            >
              <p className="font-bold self-start">
                Order ID: {refund.order_id} | Date:{" "}
                {new Date(refund.order_date).toLocaleDateString()}
              </p>
              {refund.items.map((item: any) => (
                <div
                  key={item.item_id}
                  className="flex flex-row items-center justify-between w-full"
                >
                  <p className="text-start">
                    {item.product_name} | Quantity: {item.quantity} | Price:{" "}
                    {Number(item.total_price).toFixed(2)}
                  </p>
                  <div className="w-full flex flex-row gap-4 items-center justify-end">
                    <Button
                      variant="destructive"
                      onClick={() =>
                        moderateReviewMutation({
                          itemId: item.order_item_id,
                          approve: false,
                        })
                      }
                      disabled={isPending}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() =>
                        moderateReviewMutation({
                          itemId: item.order_item_id,
                          approve: true,
                        })
                      }
                      disabled={isPending}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
