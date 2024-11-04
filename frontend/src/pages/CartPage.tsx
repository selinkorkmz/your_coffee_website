import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {addProductToCart, fetchAllProducts, fetchUserCart} from "@/lib/requests";


const API_URL = 'http://localhost:3000/api'; // Replace with your backend URL

function CartPage() {
    const [myCart, setMyCart] = useState<any>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [products, setProducts] = useState<any>([]);

    useEffect(() => {
        fetchAllProducts().then((result)=>{
            if(!result.error){
                setProducts(result.products)
            }
        })

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
            const localCart = JSON.parse(localStorage.getItem("cart")  || "[]");
            setMyCart(localCart);
        }

    }, []);
    
    return (
        <div className="flex flex-col align-center justify-center">
            {/* Products list */}
            <div className="grid grid-cols-4 gap-2">
            {products.map((item) => (
                <div key={item.product_id} className="flex flex-row align-center justify-between w-[300px]">
                    <p>id: {item.product_id}</p>
                    <p>name: {item.name}</p>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                        onClick={() => {
                            setMyCart((prev: any) => {
                                if (!prev.find((cartItem: any) => cartItem.product_id === item.product_id)) {
                                    return [...prev, item];
                                }
                                return prev;
                            });

                            if (!localStorage.getItem("user")) {
                                localStorage.setItem("cart", JSON.stringify(myCart));
                            } else {
                                addProductToCart(item.product_id, 1)
                            }
                        }}
                    >
                        Add to cart
                    </button>
                </div>
            ))}
            </div>

            {/* Cart display */}
            <p className="text-3xl">Your Cart</p>
            {myCart.map((item: any) => (
                <div key={item.product_id} className="flex flex-row align-center justify-between w-[300px]">
                    <p>id: {item.product_id}</p>
                    <p>name: {item.name}</p>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                        onClick={() => {
                            setMyCart((prev: any) => prev.filter((prevItem: any) => prevItem.product_id !== item.product_id));
                        }}
                    >
                        Remove from cart
                    </button>
                </div>
            ))}
        </div>
    );
}

export default CartPage;
