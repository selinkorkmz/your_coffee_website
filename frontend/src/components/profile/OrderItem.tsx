import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { FaChevronUp } from "react-icons/fa";
import ReviewCard from "@/components/cards/ReviewCard";

export default function OrderItem({ item }: { item: any }) {
  const [expanded, setExpanded] = useState(false);

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

        {!expanded ? <FaChevronDown /> : <FaChevronUp />}
      </div>

      {expanded && (
        <>
          <h2 className="text-center bg-yellow-700 text-white">
            Products in Order
          </h2>
          <div className="flex flex-col divide-y gap-4 divide-gray-200 mx-auto w-full">
            {item.order_items.map((orderItem) => (
              <div className="flex flex-wrap md:flex-nowrap items-center justify-between px-4 py-2 min-h-[50px]">
                {/* Product Name */}
                <div className="text-center font-bold">
                  <div>
                    <span>{orderItem.product_name}</span>
                  </div>
                </div>

                {/* Quantity */}
                <div className=" font-bold flex items-center">
                  <span>{orderItem.quantity} x</span>
                </div>

                {/* Total Price */}
                <div className="text-center">
                  <div>
                    <span className="font-semibold">Total Price:</span>
                  </div>
                  <div>
                    <span>${orderItem.total_price.toFixed(2)}</span>
                  </div>
                </div>
                {item.order_status === "Delivered" && (
                  <div className="flex justify-center mt-4">
                    <ReviewCard product={orderItem} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
