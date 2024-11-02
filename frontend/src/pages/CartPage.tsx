import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const products = [
    {
        id: 1,
        name: "espresso"
    },
    {
        id: 2,
        name: "filter"
    },
    {
        id: 3,
        name: "machine"
    },
    {
        id: 4,
        name: "capsule"
    },
    {
        id: 5,
        name: "americano"
    }
]

function CartPage() {
    const [myCart, setMyCart] = useState([])

    useEffect(() => {
        setMyCart(products) // backendden cart bilgisi alınacak
    }, [])

    useEffect(() => {
        console.log(myCart)
    }, [myCart])

    return (
        <div className="flex flex-col align-center justify-center">
            {
                products.map((item) => {
                    return (
                        <div className="flex flex-row align-center justify-between w-[300px]">
                            <p>
                                id: {item.id}
                            </p>
                            <p>
                                name: {item.name}
                            </p>
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                                onClick={
                                    () => {
                                        setMyCart((prev) => {
                                            if (!prev.find((cartItem) => cartItem.id === item.id)) {
                                                return [...prev, item]
                                            }

                                            return prev
                                        })
                                    }
                                }
                            >
                                Add to cart
                            </button>
                        </div>
                    )
                })
            }

            <p className="text-3xl">
                Your Cart
            </p>
            {
                myCart.map((item) => {
                    return (
                        <div className="flex flex-row align-center justify-between w-[300px]">
                            <p>
                                id: {item.id}
                            </p>
                            <p>
                                name: {item.name}
                            </p>
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                                onClick={
                                    () => {
                                        setMyCart((prev) => prev.filter((prevItem) => prevItem.id !== item.id))
                                    }
                                }
                            >
                                Remove from cart
                            </button>
                        </div>
                    )
                })
            }

        </div>
    )
}

export default CartPage
