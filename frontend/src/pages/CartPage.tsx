import { useEffect, useState } from "react";
import { addProductToCart, fetchUserCart, getProductById, removeProductFromCart } from "@/lib/requests";
import CartItem from "@/components/cart/CartItem";
import OrderSummary from "@/components/cart/OrderSummary";
import { CartProduct } from "@/types/product";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthContext";


function CartPage() {
    const [myCart, setMyCart] = useState<CartProduct[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const { user } = useAuth();

    const { mutate: addProductToCartMutation } = useMutation({
        mutationFn: ({
            productId,
            quantity,
        }: {
            productId: number;
            quantity: number;
        }) => addProductToCart(productId, quantity),
        onSuccess: () => {
            fetchCart()
        },
    });

    const fetchCart = () => {
        if (user) {
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
    }

    useEffect(() => {
        fetchCart();
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

    const handleAddQuantity = (product_id: number) => {
        if (user) {
            // Add to cart using the server-side mutation
            addProductToCartMutation({
                productId: product_id,
                quantity: 1,
            });
            return;
        }
        // Handle the cart in localStorage
        const localCart: any[] = JSON.parse(localStorage.getItem("cart") || "[]");

        // Check if the product already exists in the cart
        const existingProductIndex = localCart.findIndex(
            (item) => product_id === item.product_id
        );

        if (existingProductIndex !== -1) {
            localCart[existingProductIndex].quantity += 1;
        } else {
            localCart.push({
                productId: product_id,
                quantity: 1,
            });
        }
        localStorage.setItem("cart", JSON.stringify(localCart));

        fetchCart();

    }


    return (
        <section className="bg-amber-50 py-8 antialiased md:py-16">
            <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
                <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">Shopping Cart</h2>

                <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
                    <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl">
                        <div className="space-y-6">
                            {
                                myCart.map(
                                    (item: any) => (
                                        <CartItem
                                            item={item}
                                            onRemove={(product_id) => {
                                                handleRemove(product_id, item.quantity)
                                            }}
                                            onAddQuantity={handleAddQuantity}
                                        />
                                    )
                                )
                            }
                        </div>
                    </div>
                    <OrderSummary
                        cart={myCart}
                    />
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
