import "./App.css";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import Header from "./components/header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OrderStatusPage from "./pages/Admin/OrderStatusPage";
import AdminReviews from "./pages/Admin/Reviews";
import AdminSidebar from "./components/AdminSidebar";
import AuthGuard from "./components/AuthGuard";
import ProfilePage from "./pages/Profile/ProfilePage";
import { AuthProvider } from "./components/AuthContext";
import CheckoutPage from "./pages/CheckoutPage";
import AdminPanel from "./pages/Admin/AdminPanel";
import Wishlist from "./components/profile/Wishlist";
import { Bounce, ToastContainer } from "react-toastify";

const RootLayout = () => {
  return (
    <div>
      <Header />
      <main className="bg-amber-50 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/products",
        element: <ProductsPage />,
      },
      {
        path: "/products/:id",
        element: <ProductDetailsPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/admin",
        element: (
          <AuthGuard allowedRoles={["Sales Manager", "Product Manager"]}>
            <AdminPanel />,
          </AuthGuard>
        ),
      },
      {
        path: "/checkout",
        element: <CheckoutPage />,
      },
      {
        path: "/wishlist",
        element: <Wishlist />,
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer
position="top-right"
autoClose={5000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick={false}
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="colored"
transition={Bounce}
/>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
