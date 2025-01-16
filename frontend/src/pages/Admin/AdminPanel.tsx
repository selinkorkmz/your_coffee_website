import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import OrderStatusPage from "./OrderStatusPage";
import AdminLanding from "./Reviews";
import ProductManagementPage from "./ProductManagementPage";
import ProfitLossRevenueSalesChart from "@/components/ProfitLossRevenueSalesChart";
import SalesManagement from "./SalesManagement";

export default function AdminPanel() {
  const [displayedScreen, setDisplayedScreen] = useState("reviews");
  const [params] = useSearchParams();

  useEffect(() => {
    if (params.has("display")) {
      setDisplayedScreen(params.get("display")!);
    }
  }, []);

  function displayContent() {
    switch (displayedScreen) {
      case "reviews":
        return <AdminLanding />;
      case "orderStatuses":
        return <OrderStatusPage />;
      case "productManagement":
        return <ProductManagementPage />;
      case "charts":
        return <ProfitLossRevenueSalesChart />;
      case "salesManagement":
        return <SalesManagement />;
    }
  }

  return (
    <div className="flex flex-row divide-x">
      <div className="flex-1 lg:left-0 p-2 w-[200px] overflow-y-auto text-center ">
        <div className="text-xl">
          <div className="p-2.5 mt-1 flex items-center">
            {displayedScreen === "panel" && (
              <i className="bi bi-app-indicator px-2 py-1 rounded-md bg-blue-600"></i>
            )}
            <h1 className="font-bold text-black text-[15px] ml-3">
              Admin Panel
            </h1>
            <i className="bi bi-x cursor-pointer ml-28 lg:hidden"></i>
          </div>
          <div className="my-2 bg-gray-600 h-[1px]"></div>
        </div>

        <div
          className="p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-blue-600 text-white"
          onClick={() => setDisplayedScreen("reviews")}
        >
          {displayedScreen === "reviews" && (
            <i className="bi bi-app-indicator px-2 py-1 rounded-md bg-blue-600"></i>
          )}
          <span className="text-[15px] text-black ml-4 font-bold">
            Review Approval{" "}
          </span>
        </div>

        <div
          className="p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-blue-600 text-white"
          onClick={() => setDisplayedScreen("productManagement")}
        >
          {displayedScreen === "productManagement" && (
            <i className="bi bi-app-indicator px-2 py-1 rounded-md bg-blue-600"></i>
          )}
          <span className="text-[15px] ml-4 text-black font-bold">
            Product Management
          </span>
        </div>

        <div
          className="p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-blue-600 text-white"
          onClick={() => setDisplayedScreen("orderStatuses")}
        >
          {displayedScreen === "orderStatuses" && (
            <i className="bi bi-app-indicator px-2 py-1 rounded-md bg-blue-600"></i>
          )}
          <span className="text-[15px] ml-4 text-black font-bold">
            Order Statuses
          </span>
        </div>

        <div
          className="p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-blue-600 text-white"
          onClick={() => setDisplayedScreen("charts")}
        >
          {displayedScreen === "charts" && (
            <i className="bi bi-app-indicator px-2 py-1 rounded-md bg-blue-600"></i>
          )}
          <span className="text-[15px] ml-4 text-black font-bold">Charts</span>
        </div>

        <div
          className="p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-blue-600 text-white"
          onClick={() => setDisplayedScreen("salesManagement")}
        >
          {displayedScreen === "salesManagement" && (
            <i className="bi bi-app-indicator px-2 py-1 rounded-md bg-blue-600"></i>
          )}
          <span className="text-[15px] ml-4 text-black font-bold">
            Refund Management
          </span>
        </div>
      </div>
      <div className="w-[80%]">{displayContent()}</div>
    </div>
  );
}
