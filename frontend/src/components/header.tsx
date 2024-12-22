import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Header = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null); // Update global state
        navigate("/")
        
    };

    return (
        <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-amber-50">
            <Link to="/" className="text-black hover:text-black">
                <h1 className="text-2xl font-bold">Your Coffee</h1>
            </Link>
            <nav className="flex items-center gap-4">
                <Link to="/products" className="text-black hover:text-bold">
                    Products
                </Link>
                <Link to="/cart" className="text-black hover:text-bold">
                    Cart
                </Link>
                <Link to="/wishlist" className="text-black hover:text-bold">
                    Wishlist
                </Link>
                {user ? (
                    <div className="flex items-center gap-4">
                        <Link to="/profile" className="text-black hover:text-bold">
                            {user.name}
                        </Link>
                        {user.role !== "Customer" && (
                            <Link to="/admin" className="text-black hover:text-black">
                                Admin Panel
                            </Link>
                        )}
                        <p
                            onClick={handleLogout}
                            className="text-black hover:text-bold cursor-pointer"
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
