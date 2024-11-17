import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [user, setUser] = useState<any>();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-amber-50">
      <Link to="/" className="text-black hover:text-black">
        <h1 className="text-2xl font-bold">Your Coffee</h1>
      </Link>
      <nav className="flex items-center gap-4">
        <Link
          to="/products?category=Coffee&subCategory=all-Coffee"
          className="text-black hover:text-black"
        >
          Products
        </Link>
        <Link to="/cart" className="text-black hover:text-black">
          Cart
        </Link>
        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/profile" className="text-black hover:text-bold">
              {user.name}
            </Link>
            {
              user.role !== "Customer" && <Link to="/admin" className="text-black hover:text-black">
              Admin Panel
            </Link>
            }
            <p
              onClick={() => {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                setUser(null);
              }}
              className="text-black hover:text-black cursor-pointer"
            >
              Logout
            </p>
          </div>
        ) : (
          <Link to="/login" className="text-black hover:text-black">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
