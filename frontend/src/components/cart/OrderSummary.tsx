import { initiatePayment } from "@/lib/requests";
import { CartProduct } from "@/types/product";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";


export default function OrderSummary({ cart }: { cart: CartProduct[] }) {
    const navigate = useNavigate();
    
    const { mutate: initiatePaymentMutation } = useMutation({
        mutationFn: () => initiatePayment(),
        onSuccess: (data) => {
          if (data?.error){
            alert(data.error) 
            return
          }

          navigate(`/payment?orderId=${data?.orderId}`)
        },
      });
      
    // Calculate the original price, savings, and total price
    const { origPrice, savings, totalPrice } = cart.reduce(
        (acc, item) => {
            const itemOriginalPrice = item.price * item.quantity;
            const itemDiscountedPrice = (item.discounted_price || item.price) * item.quantity;
            const itemSavings = itemOriginalPrice - itemDiscountedPrice;

            acc.origPrice += itemOriginalPrice;
            acc.savings += itemSavings;
            acc.totalPrice += itemDiscountedPrice;

            return acc;
        },
        { origPrice: 0, savings: 0, totalPrice: 0 }
    );

    const handleCheckout = () => {
        // Redirect to the checkout form page
        
    };

    return (
        <div className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
            <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <p className="text-xl font-semibold text-gray-900">Order summary</p>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <dl className="flex items-center justify-between gap-4">
                            <dt className="text-base font-normal text-gray-500">Original price</dt>
                            <dd className="text-base font-medium text-gray-900">${origPrice.toFixed(2)}</dd>
                        </dl>

                        <dl className="flex items-center justify-between gap-4">
                            <dt className="text-base font-normal text-gray-500">Savings</dt>
                            <dd className="text-base font-medium text-green-600">-${savings.toFixed(2)}</dd>
                        </dl>
                    </div>

                    <dl className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2">
                        <dt className="text-base font-bold text-gray-900">Total</dt>
                        <dd className="text-base font-bold text-gray-900">${totalPrice.toFixed(2)}</dd>
                    </dl>
                </div>

                <button
                    onClick={handleCheckout}
                    className="flex w-full items-center justify-center bg-gray-100 rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-black hover:bg-primary-800 hover:text-blue-700 "
                >
                    Proceed to Checkout
                </button>

                <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-normal text-gray-500"> or </span>
                    <a
                        href="/products"
                        title="Go to Products Page"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-800 underline hover:no-underline"
                    >
                        Continue Shopping
                        <svg
                            className="h-5 w-5"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 12H5m14 0-4 4m4-4-4-4"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}
