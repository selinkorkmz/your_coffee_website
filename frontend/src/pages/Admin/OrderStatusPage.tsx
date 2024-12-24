import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllOrders, updateOrderStatus } from "@/lib/requests";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { DatePicker } from "@/components/ui/datePicker";
import { useAuth } from "@/components/AuthContext";

const STATUSES = ["Processing", "In-Transit", "Delivered"];
const now = Date.now()
function OrderStatusPage() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState<Date>(
    new Date(now - 7 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState<Date>(new Date(now));
  const [showDatePickers, setShowDatePickers] = useState(false);
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
    <div className="flex gap-4 p-4 h-full">
      {/* Left Side - Orders List */}
      <div className="flex-1 overflow-auto">
        <div className="flex justify-center">
          <h1 className="text-2xl font-bold mb-4">Orders</h1>
        </div>
        
        {data?.orders
          .slice()
          .filter((order: any) => {
            const orderDate = new Date(order.order_date);
            return (
              orderDate.getTime() >= startDate.setHours(0, 0) &&
              orderDate.getTime() <= endDate.setHours(23, 59)
            );
          })
          .reverse()
          .map((order: any) => (
            <div
              key={order.order_id}
              className="flex flex-col bg-white gap-2 border-2 border-gray-200 p-4 rounded-md mb-4"
            >
              <p>Order ID: {order.order_id}</p>
              <p>Order Status: {order.order_status}</p>
              <p>Order Date: {order.order_date}</p>
              <p>Payment Method: {order.delivery_address}</p>
              <p>Payment Status: {order.payment_status}</p>
              <p>Delivery Address: {order.payment_method}</p>
              <p>Transaction Date: {order.transaction_date}</p>
              <p className="font-bold">Items:</p>
              <ol>
                {order.items.map((item: any) => (
                  <li key={item.product_id}>
                    {item.quantity}x {item.product_name}
                  </li>
                ))}
              </ol>
              <div className="flex items-center gap-2">
                <p>Status:</p>
                {user.role === "Product Manager" ? (
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
                ) : user.role === "Sales Manager" ? (
                  <span>{order.order_status}</span>
                ) : null}
                <button
                  onClick={() => {
                    window
                      .open(
                        `http://localhost:3000/invoice/invoice-${order.order_id}-${new Date(
                          order.order_date
                        ).getTime()}.pdf`,
                        "_blank"
                      )
                      ?.focus();
                  }}
                  type="button"
                  className="flex items-center text-red-700 hover:text-white border border-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-3 py-2 text-center"
                >
                  See Invoice
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Right Side - Button and Date Pickers */}
      <div className="w-1/3 flex flex-col gap-4">
        <button
          onClick={() => setShowDatePickers(!showDatePickers)}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg"
        >
          {showDatePickers ? "Hide Date Selection" : "Select Start & End Date"}
        </button>
        {showDatePickers && (
          <div className="flex flex-col gap-4">
            <DatePicker
              selected={startDate}
              setSelected={(date) => setStartDate(date)}
            />
            <DatePicker
              selected={endDate}
              setSelected={(date) => setEndDate(date)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderStatusPage;
