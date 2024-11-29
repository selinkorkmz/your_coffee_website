import { Link } from "react-router-dom";

export default function ProfilePage() {
    return <>
        <div
      className="sidebar top-0 bottom-0 lg:left-0 p-2 w-[300px] overflow-y-auto text-center bg-amber-50"
    >
      <div className="text-xl">
        <div className="p-2.5 mt-1 flex items-center">
          <i className="bi bi-app-indicator px-2 py-1 rounded-md bg-blue-600"></i>
          <h1 className="font-bold text-black text-[15px] ml-3">My Profile</h1>
          <i
            className="bi bi-x cursor-pointer ml-28 lg:hidden"
          ></i>
        </div>
        <div className="my-2 bg-gray-600 h-[1px]"></div>
      </div>
      <Link to={"/admin/order-status"}>
      <div
        className="p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-blue-600 text-white"
      >
        <span className="text-[15px] text-black ml-4 font-bold">My Orders</span>
      </div>
      </Link>

      <div
        className="p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-blue-600 text-white"
      >
        <span className="text-[15px] ml-4 text-black font-bold">My Reviews</span>
      </div>
      
      <div
        className="p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-blue-600 text-white"
      >
        <span className="text-[15px] ml-4 text-black font-bold">Wishlist</span>
      </div>
      
    </div>

    </>

}