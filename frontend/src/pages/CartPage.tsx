import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addProductToCart, fetchAllProducts, fetchUserCart, getProductById, removeProductFromCart } from "@/lib/requests";
import CartItem from "@/components/cart/CartItem";


const API_URL = 'http://localhost:3000/api'; // Replace with your backend URL

function CartPage() {
    const [myCart, setMyCart] = useState<any>([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        // Check for saved user in local storage
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            // If user is logged in, fetch cart data from backend
            fetchUserCart().then((result) => {
                if (result.error) {
                    setErrorMessage(result.error)
                    return;
                }

                setMyCart(result.cart);

            });

        } else {
            // If no user is logged in, load cart data from local storage
            const localCart: any[] = JSON.parse(localStorage.getItem("cart") || "[]");



            const cartProductDetails = localCart.map((item) => {
                return getProductById(item.productId).then((res) => {
                    if (res.error) {
                        setErrorMessage(res.error)
                        return;
                    }

                    return { ...res.product, quantity: item.quantity }
                })
            });

            Promise.all(cartProductDetails).then((result) => {
                setMyCart(result);
            })
        }

    }, []);

    const handleRemove = (productId: number, quantity: number) => {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            // If user is logged in, fetch cart data from backend
            removeProductFromCart(productId, quantity).then((res) => {
                if (res.error) {
                    setErrorMessage(res.error)
                    return
                }

                setMyCart((prev: any) => prev.filter((prevItem: any) => prevItem.product_id !== productId));
            })

        } else {
            // If no user is logged in, load cart data from local storage
            const cartStr = localStorage.getItem("cart")
            const cart: any[] = JSON.parse(cartStr ?? "[]")

            localStorage.setItem("cart", JSON.stringify(cart.filter((item) => item.productId !== productId)));


            setMyCart((prev: any) => prev.filter((prevItem: any) => prevItem.product_id !== productId));
        }




    }


    return (
        <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
            <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Shopping Cart</h2>

                <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
                    <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl">
                        <div className="space-y-6">
                        {
                            myCart.map(
                                (item: any) => (
                                    <CartItem item={item} onRemove={(product_id)=>{
                                        handleRemove(product_id, item.quantity)
                                    }} />
                                )
                            )
                        }
                        </div>
                    </div>

                    <div className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
                        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">Order summary</p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <dl className="flex items-center justify-between gap-4">
                                        <dt className="text-base font-normal text-gray-500 dark:text-gray-400">Original price</dt>
                                        <dd className="text-base font-medium text-gray-900 dark:text-white">$7,592.00</dd>
                                    </dl>

                                    <dl className="flex items-center justify-between gap-4">
                                        <dt className="text-base font-normal text-gray-500 dark:text-gray-400">Savings</dt>
                                        <dd className="text-base font-medium text-green-600">-$299.00</dd>
                                    </dl>

                                    <dl className="flex items-center justify-between gap-4">
                                        <dt className="text-base font-normal text-gray-500 dark:text-gray-400">Store Pickup</dt>
                                        <dd className="text-base font-medium text-gray-900 dark:text-white">$99</dd>
                                    </dl>

                                    <dl className="flex items-center justify-between gap-4">
                                        <dt className="text-base font-normal text-gray-500 dark:text-gray-400">Tax</dt>
                                        <dd className="text-base font-medium text-gray-900 dark:text-white">$799</dd>
                                    </dl>
                                </div>

                                <dl className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
                                    <dt className="text-base font-bold text-gray-900 dark:text-white">Total</dt>
                                    <dd className="text-base font-bold text-gray-900 dark:text-white">$8,191.00</dd>
                                </dl>
                            </div>

                            <a href="#" className="flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Proceed to Checkout</a>

                            <div className="flex items-center justify-center gap-2">
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> or </span>
                                <a href="#" title="" className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 underline hover:no-underline dark:text-primary-500">
                                    Continue Shopping
                                    <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
                            <form className="space-y-4">
                                <div>
                                    <label for="voucher" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> Do you have a voucher or gift card? </label>
                                    <input type="text" id="voucher" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="" required />
                                </div>
                                <button type="submit" className="flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Apply Code</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )

    /*
    
        return (
            <div classNameName="flex flex-col align-center justify-center">
                
                {errorMessage && <p classNameName="text-3xl">{errorMessage}</p>}
                <p classNameName="text-3xl">Your Cart</p>
                {myCart.map((item: any) => (
                    <div key={item.product_id} classNameName="flex flex-row align-center justify-between w-[300px]">
                        <p>id: {item.product_id}</p>
                        <p>name: {item.name}</p>
                        <p>quantity: {item.quantity}</p>
                        <button
                            classNameName="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                            onClick={() => handleRemove(item.product_id, item.quantity)}
                        >
                            Remove from cart
                        </button>
                    </div>
                ))}
            </div>
        );
        */
}

export default CartPage;
