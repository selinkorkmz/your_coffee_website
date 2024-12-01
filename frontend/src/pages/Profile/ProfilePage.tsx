import UserOrders from "@/components/profile/UserOrders";
import UserProfile from "@/components/profile/UserProfile";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function ProfilePage() {
  const [displayedScreen, setDisplayedScreen] = useState("profile")
  const [params, setParams] = useSearchParams()

  useEffect(() => {
    if(params.has("display")){
      setDisplayedScreen(params.get("display")!)
    }
  },[])

  function displayContent() {
    switch (displayedScreen) {
      case "profile":
        return (<UserProfile />)
      case "orders":
        return (<UserOrders />)
      case "reviews":
        return (<></>)
      case "wishlist":
        return (<></>)
    }
  }

  return <div className="flex flex-row">
    <div
      className="flex-none lg:left-0 p-2 w-[200px] overflow-y-auto text-center bg-amber-50"
    >
      <div className="text-xl" onClick={() => setDisplayedScreen("profile")}>
        <div className="p-2.5 mt-1 flex items-center">
          {displayedScreen === "profile" && <i className="bi bi-app-indicator px-2 py-1 rounded-md bg-blue-600"></i>}
          <h1 className="font-bold text-black text-[15px] ml-3">My Profile</h1>
          <i
            className="bi bi-x cursor-pointer ml-28 lg:hidden"
          ></i>
        </div>
        <div className="my-2 bg-gray-600 h-[1px]"></div>
      </div>

        <div
          className="p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-blue-600 text-white"
          onClick={() => setDisplayedScreen("orders")}
        >
          {displayedScreen === "orders" && <i className="bi bi-app-indicator px-2 py-1 rounded-md bg-blue-600"></i>}
          <span className="text-[15px] text-black ml-4 font-bold">My Orders</span>
        </div>

      <div
        className="p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-blue-600 text-white"
        onClick={() => setDisplayedScreen("reviews")}
      > 
       {displayedScreen === "reviews" && <i className="bi bi-app-indicator px-2 py-1 rounded-md bg-blue-600"></i>}
        <span className="text-[15px] ml-4 text-black font-bold">My Reviews</span>
      </div>

      <div
        className="p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-blue-600 text-white"
        onClick={() => setDisplayedScreen("wishlist")}
      >
        {displayedScreen === "wishlist" && <i className="bi bi-app-indicator px-2 py-1 rounded-md bg-blue-600"></i>}
        <span className="text-[15px] ml-4 text-black font-bold">Wishlist</span>
      </div>

    </div>
    <div className="w-[100%]">{displayContent()}</div>
    

  </div>

}