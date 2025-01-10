import { useState, useEffect } from "react";
import { fetchWishlist, removeFromWishlist } from "@/lib/requests";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Product } from "@/types/product";

function Wishlist() {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserWishlist = async () => {
      setLoading(true);
      const user = localStorage.getItem("user");
      const parsedUser = JSON.parse(user ?? "{}");

      if (!parsedUser?.user_id) {
        setError("Please log in to view your wishlist.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetchWishlist(parsedUser.user_id);
        if (response.success) {
          setWishlist(response.wishlist || []);
        } else {
          return (
            <div className="flex flex-col items-center justify-center h-[80vh]">
              <p className="text-lg font-medium text-gray-600 mt-4">
                Your wishlist is currently empty.
              </p>
            </div>
          );
        }
      } catch (err) {
        setError("An error occurred while fetching your wishlist.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserWishlist();
  }, []);

  const handleRemove = async (productId: number) => {
    const user = localStorage.getItem("user");
    const parsedUser = JSON.parse(user ?? "{}");

    if (!parsedUser?.user_id) {
      setError("Please log in to remove items from your wishlist.");
      return;
    }

    try {
      const response = await removeFromWishlist(parsedUser.user_id, productId);
      if (response.success) {
        setWishlist((prev) => prev.filter((item) => item.product_id !== productId));
      } else {
        alert(response.error || "Failed to remove item from wishlist.");
      }
    } catch (err) {
      alert("An error occurred while removing the item from your wishlist.");
    }
  };

  if (loading) {
    return <p className="text-center text-lg">Loading...</p>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <p className="text-lg font-medium text-red-600 mt-4">{error}</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <p className="text-lg font-medium text-gray-600 mt-4">
          Your wishlist is currently empty.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.map((product) => (
          <div
            key={product.product_id}
            className="border border-gray-200 rounded-lg p-4 shadow-md"
          >
            <Link to={`/products/${product.product_id}`} className="block">
              <img
                src={
                  product.image_url ||
                  (product.category === "Coffee"
                    ? "https://upload.wikimedia.org/wikipedia/commons/c/c5/Roasted_coffee_beans.jpg"
                    : product.category === "Coffee Machines"
                    ? "https://assets.bonappetit.com/photos/61e755ce6b6fe523b0365397/16:9/w_1280,c_limit/20220112%20Best%20Coffee%20Maker%20LEDE.jpg"
                    : product.category === "Drinks"
                    ? "https://assets.bonappetit.com/photos/620fc9f986a3bcc597572d1c/3:2/w_6507,h_4338,c_limit/20220215%20Coffee%20Alternatives%20LEDE.jpg"
                    : product.category === "Accessories"
                    ? "https://img.freepik.com/free-photo/still-life-coffee-tools_23-2149371282.jpg"
                    : "https://upload.wikimedia.org/wikipedia/commons/c/c5/Roasted_coffee_beans.jpg")
                }
                alt={product.name}
                className="w-full h-40 object-cover rounded-lg mb-2"
              />
              <h3 className="text-lg font-medium">{product.name}</h3>
            </Link>
            <p className="text-gray-500 text-sm">{product.description}</p>
            <div className="flex items-center justify-between mt-2">
              {product.discounted_price ? (
                <>
                  <span className="text-lg text-black font-bold">
                    ${product.discounted_price.toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    ${product.price}
                  </span>
                </>
              ) : (
                <span className="text-lg text-black font-bold">
                  ${product.price}
                </span>
              )}
            </div>
            <Button
              className="mt-4 w-full bg-red-500 text-white"
              onClick={() => handleRemove(product.product_id)}
            >
              Remove from Wishlist
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
