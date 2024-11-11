import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addProductToCart, fetchAllProducts, fetchUserCart, getProductById, removeProductFromCart } from "@/lib/requests";


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

    const handleRemove = (productId, quantity) => {
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
        <div className="flex flex-col align-center justify-center">
            {/* Cart display */}
            {errorMessage && <p className="text-3xl">{errorMessage}</p>}
            <p className="text-3xl">Your Cart</p>
            {myCart.map((item: any) => (
                <div key={item.product_id} className="flex flex-row align-center justify-between w-[300px]">
                    <p>id: {item.product_id}</p>
                    <p>name: {item.name}</p>
                    <p>quantity: {item.quantity}</p>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                        onClick={() => handleRemove(item.product_id, item.quantity)}
                    >
                        Remove from cart
                    </button>
                </div>
            ))}
        </div>
    );
}

export default CartPage;
