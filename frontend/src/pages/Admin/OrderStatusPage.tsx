import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllOrders, updateOrderStatus } from "@/lib/requests";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES = ["Processing", "In-Transit", "Delivered"];

function OrderStatusPage() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["orders"],
    queryFn: getAllOrders,
  });

  const { mutate: updateOrderStatusMutation } = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Orders</h1>
      {data?.orders.map((order: any) => (
        <div
          key={order.order_id}
          className="flex flex-col gap-2 border-2 border-gray-200 p-4 rounded-md"
        >
          <p>Order ID: {order.order_id}</p>
          <p>Order Status: {order.order_status}</p>
          <p>Order Date: {order.order_date}</p>
          <p>Delivery Address: {order.delivery_address}</p>
          <p>Payment Status: {order.payment_status}</p>
          <p>Payment Method: {order.payment_method}</p>
          <p>Transaction Date: {order.transaction_date}</p>
          <p className="font-bold">Items:</p>
          <ol>
            {order.items.map((item: any) => (
              <li key={item.product_id}>
                {item.product_name} - {item.quantity}
              </li>
            ))}
          </ol>
          <div className="flex items-center gap-2">
            <p>Status:</p>
            <Select
              onValueChange={(value) =>
                updateOrderStatusMutation({
                  orderId: order.order_id,
                  status: value,
                })
              }
              value={order.order_status}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="max-w-xs">
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrderStatusPage;
