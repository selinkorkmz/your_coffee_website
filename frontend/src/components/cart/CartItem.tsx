import { CartProduct } from "@/types/product";



export default function CartItem({ item, onRemove, onAddQuantity }: { item: CartProduct, onRemove: (product_id: number) => void, onAddQuantity: (product_id: number) => void }) {
    function handleDecrement() {

    }
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
                <a href="#" className="w-20 shrink-0 md:order-1">
                    <img className="h-20 w-20" src={item.image_url ?? "https://upload.wikimedia.org/wikipedia/commons/c/c5/Roasted_coffee_beans.jpg"} alt="imac image" />
                </a>

                <label htmlFor="counter-input" className="sr-only">Choose quantity:</label>
                <div className="flex items-center justify-between md:order-3 md:justify-end">
                    <div className="flex items-center">
                        <button
                            onClick={() => console.log("decremenr")}
                            type="button"
                            id="decrement-button-5"
                            className="flex h-7 w-5 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200"
                        >
                            -
                        </button>
                        <input
                            type="text"
                            id="counter-input-5"
                            className="w-10 shrink-0 border-0 bg-transparent text-center text-sm font-medium text-gray-900"
                            placeholder=""
                            value={item.quantity}
                            required
                            readOnly
                        />
                        <button
                            onClick={() => onAddQuantity(item.product_id)}
                            type="button"
                            id="increment-button-5"
                            className="flex h-7 w-5 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200"
                        >
                            +
                        </button>
                    </div>

                    <div className="text-end md:order-4 md:w-32">
                        <div className="text-base font-bold text-gray-900 ">{item.discounted_price ? (
                            <div className="flex flex-col">
                                <span className="text-lg text-gray-500 line-through">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </span>
                                <span className="text-lg text-black font-bold">
                                    ${(item.discounted_price * item.quantity).toFixed(2)}
                                </span>

                            </div>
                        ) : (
                            <span className="text-lg text-black font-bold">
                                ${(item.price * item.quantity).toFixed(2)}
                            </span>
                        )
                        } </div>
                    </div>
                </div>

                <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
                    <a href={`/products/${item.product_id}`} className="text-base font-medium text-gray-900 hover:underline "> {item.name} </a>

                    <div className="flex items-center gap-4">
                        <button type="button" className="inline-flex items-center text-sm font-medium text-gray-900 bg-gray-100 hover:text-gray-900 hover:underline ">
                            <svg className="me-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z" />
                            </svg>
                            Add to Favorites
                        </button>

                        <button type="button" className="inline-flex items-center text-sm font-medium bg-gray-100 text-red-600 hover:underline"
                            onClick={() => onRemove(item.product_id)}
                        >
                            <svg className="me-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6" />
                            </svg>
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
