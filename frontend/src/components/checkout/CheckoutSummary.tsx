import { CartProduct } from "@/types/product";


export default function CheckoutSummary({ cart }: { cart: CartProduct[] }) {      
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
            </div>
        </div>
    );
}
