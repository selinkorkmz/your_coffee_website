import { CartProduct } from "@/types/product";



export default function OrderItem({ item }: { item: any }) {
    
    
        return (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm min-h-[100px]">
                <div className="flex flex-wrap md:flex-nowrap items-center justify-center px-4 py-4 min-h-[100px]">
                    {/* Items Count - Vertically Centered */}
                    <div className="flex-none text-begin font-bold flex items-center">
                        <span>{item.order_items.length} items</span>
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
                            <span>${item.order_items.reduce((acc, cur) => acc + cur.total_price, 0)}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
        
    
    
}
