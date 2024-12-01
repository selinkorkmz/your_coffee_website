import { getOrders } from "@/lib/requests";
import { useQuery } from "@tanstack/react-query";
import { FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import OrderItem from "./OrderItem";

function UserOrders() {
    const navigate = useNavigate()

    const { data, isLoading } = useQuery({
        queryKey: ["orders"],
        queryFn: () => getOrders(),
      });

      if(isLoading) {
        return null;
      }

    return (
        <section className="bg-amber-50 py-8 antialiased md:py-16">
            <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
                <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">Orders</h2>
    
                {data?.orders?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[80vh]">
                    <FiShoppingCart className="text-primary-600 w-20 h-20" />
                    <p className="text-lg font-medium text-gray-600 mt-4">
                        You don't have any orders!
                    </p>
                    <button
                        onClick={() => navigate("/products")}
                        className="mt-6 px-6 py-2 text-secondary-foreground bg-secondary hover:bg-secondary/90 font-medium text-sm rounded-lg focus:ring-4 focus:ring-secondary/50"
                    >
                        Browse Products
                    </button>
                </div>
                ) : (
                    <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
                        <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl">
                            <div className="space-y-6">
                                {data?.orders?.map((item: any) => (
                                    <OrderItem item={item} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
    

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
export default UserOrders;
