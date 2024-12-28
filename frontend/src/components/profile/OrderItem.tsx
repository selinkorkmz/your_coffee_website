import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { FaChevronUp } from "react-icons/fa";
import ReviewCard from "@/components/cards/ReviewCard";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { requestRefund, cancelOrder, getOrderDetails } from "@/lib/requests";
import { useMutation, QueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
const queryClient = new QueryClient();

export default function OrderItem({ item }: { item: any }) {
  const [expanded, setExpanded] = useState(false);
  const canRefund =
    item.order_status === "Delivered" || item.order_status === "In-Transit";
  const canCancel =
    item.order_status === "In-Transit" || item.order_status === "Processing";

  const { mutate: cancelOrderMutation, isPending } = useMutation({
    mutationFn: async () => cancelOrder(item.order_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order canceled");
    },
  });

  return (
    <div className="flex flex-col divide-y rounded-lg border border-gray-200 bg-white shadow-sm min-h-[100px]">
      <div
        onClick={() => setExpanded((prev) => !prev)}
        className="flex flex-wrap md:flex-nowrap items-center justify-center px-4 py-4 min-h-[100px]"
      >
        {/* Items Count - Vertically Centered */}
        <div className="flex-none text-begin font-bold flex items-center">
          <span>
            {item.order_items.reduce((acc, cur) => acc + cur.quantity, 0)} items
          </span>
        </div>

        {/* Order Date */}
        <div className="flex-1 text-center">
          <div>
            <span className="font-semibold">Order Date:</span>
          </div>
          <div>
            <span>{new Date(item.order_date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Order Status */}
        <div className="flex-1 text-center">
          <div>
            <span className="font-semibold">Order Status:</span>
          </div>
          <div>
            <span>{item.order_status}</span>
          </div>
        </div>

        {/* Total Price */}
        <div className="flex-1 text-center">
          <div>
            <span className="font-semibold">Total Price:</span>
          </div>
          <div>
            <span>
              $
              {item.order_items
                .reduce((acc, cur) => acc + cur.total_price, 0)
                .toFixed(2)}
            </span>
          </div>
        </div>

        {canCancel && (
          <div className="flex-1 text-center">
            <Button
              className="bg-red-500 text-white px-4 py-2 rounded-md"
              onClick={() => cancelOrderMutation()}
              disabled={isPending}
            >
              Cancel Order
            </Button>
          </div>
        )}

        {!expanded ? <FaChevronDown /> : <FaChevronUp />}
      </div>

      {expanded && (
        <>
          <h2 className="text-center bg-yellow-700 text-white">
            Products in Order
          </h2>
          <div className="flex flex-col divide-y divide-gray-200 mx-auto w-full">
            {item.order_items.map((orderItem) => (
              <div className="flex flex-wrap md:flex-nowrap items-center justify-between px-4 py-6 min-h-[50px]">
                {/* Product Name */}
                <div className="font-bold w-[20%]">
                  <div>
                    <span>{orderItem.product_name}</span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="text-center font-bold w-[20%]">
                  <span>{orderItem.quantity} x</span>
                </div>

                {/* Total Price */}
                <div className="text-center w-[20%]">
                  <div>
                    <span className="font-semibold">Total Price:</span>
                  </div>
                  <div>
                    <span>${orderItem.total_price.toFixed(2)}</span>
                  </div>
                </div>
                {item.order_status === "Delivered" && (
                  <div className="flex justify-center w-[40%]">
                    <ReviewCard product={orderItem} />
                  </div>
                )}
                {canRefund && (
                  <RefundSection
                    orderId={item.order_id}
                    productId={orderItem.product_id}
                    totalQuantity={orderItem.quantity}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const RefundSection = ({
  orderId,
  productId,
  totalQuantity,
}: {
  orderId: number;
  productId: number;
  totalQuantity: number;
}) => {
  const [refundQuantity, setRefundQuantity] = useState(totalQuantity);
  const { data: orderDetails } = useQuery({
    queryKey: ["orderDetails", orderId],
    queryFn: () => getOrderDetails(orderId),
  });
  const [orderItemStatus, setOrderItemStatus] = useState(
    orderDetails?.order?.orderItems.find(
      (item: any) => item.product_id === productId
    ).item_status
  );

  console.log(orderDetails);

  useEffect(() => {
    setOrderItemStatus(
      orderDetails?.order?.orderItems.find(
        (item: any) => item.product_id === productId
      ).item_status
    );
  }, [orderDetails]);

  const { mutate: requestRefundMutation } = useMutation({
    mutationFn: async ({
      orderId,
      productId,
      quantity,
    }: {
      orderId: number;
      productId: number;
      quantity: number;
    }) => {
      const orderItemId = orderDetails?.order?.orderItems.find(
        (item: any) => item.product_id === productId
      ).order_item_id;
      requestRefund(orderId, orderItemId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Refund request submitted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="flex flex-col justify-center gap-2">
      {orderItemStatus ? (
        <p>{orderItemStatus}</p>
      ) : (
        <>
          <Button
            className="bg-red-500 text-white px-4 py-2 rounded-md"
            onClick={() =>
              requestRefundMutation({
                orderId,
                productId,
                quantity: refundQuantity,
              })
            }
          >
            Request Return
          </Button>
          <Input
            type="number"
            placeholder="Quantity"
            defaultValue={refundQuantity}
            onChange={(e) => setRefundQuantity(Number(e.target.value))}
          />
        </>
      )}
    </div>
  );
};
