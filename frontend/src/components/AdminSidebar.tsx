import { Link } from "react-router-dom";

const ADMIN_ROUTES = [
  {
    path: "/admin/reviews",
    name: "Reviews",
  },
  {
    path: "/admin/order-status",
    name: "Order Statuses",
  },
  {
    path: "/admin/products",
    name: "Products",
  },
];

const AdminSidebar = () => {
  return (
    <div className="top-0 bottom-0 lg:left-0 p-2 w-[300px] overflow-y-auto text-center bg-amber-50 border-r border-gray-200 h-screen">
      {ADMIN_ROUTES.map((route) => (
        <Link to={route.path} key={route.path}>
          <div className="p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:opacity-80 text-white">
            <span className="text-[15px] text-black ml-4 font-bold">
              {route.name}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default AdminSidebar;
