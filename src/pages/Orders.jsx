import React, { useState, useEffect, useMemo } from "react";
import BottomNav from "../components/shared/BottomNav";
import OrderCard from "../components/orders/OrderCard";
import BackButton from "../components/shared/BackButton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getOrders } from "../https/index";
import { useSnackbar } from "notistack";

const Orders = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [status, setStatus] = useState("all");

  useEffect(() => {
    document.title = "POS | Orders";
  }, []);

  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    placeholderData: keepPreviousData,
  });

  // 🔴 Error handling صح
  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
    }
  }, [isError, enqueueSnackbar]);

  // ✅ تأمين الداتا
  const orders = Array.isArray(resData?.data?.data)
    ? resData.data.data
    : [];

  // ✅ فلترة حسب الحالة
  const filteredOrders = useMemo(() => {
    if (status === "all") return orders;

    if (status === "progress") {
      return orders.filter(order => order.orderStatus === "Pending");
    }

    if (status === "ready") {
      return orders.filter(order => order.orderStatus === "Ready");
    }

    if (status === "completed") {
      return orders.filter(order => order.orderStatus === "Completed");
    }

    return orders;
  }, [orders, status]);

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Orders
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {["all", "progress", "ready", "completed"].map((item) => (
            <button
              key={item}
              onClick={() => setStatus(item)}
              className={`text-[#ababab] text-lg px-5 py-2 font-semibold rounded-lg ${
                status === item ? "bg-[#383838]" : ""
              }`}
            >
              {item === "all"
                ? "All"
                : item === "progress"
                ? "In Progress"
                : item === "ready"
                ? "Ready"
                : "Completed"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 px-16 py-4 overflow-y-scroll scrollbar-hide">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))
        ) : (
          <p className="col-span-3 text-gray-500 text-center mt-10">
            No orders available
          </p>
        )}
      </div>

      <BottomNav />
    </section>
  );
};

export default Orders;
