import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../https/index";
import { enqueueSnackbar } from "notistack";

const RecentOrders = () => {
  const { data: ordersRes, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const orders = ordersRes?.data?.data || [];

  // فلترة طلبات اليوم فقط
  const todayOrders = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // بداية اليوم

    return orders.filter((order) => {
      if (!order?.orderDate) return false;
      const orderDate = new Date(order.orderDate);
      return orderDate >= todayStart;
    });
  }, [orders]);

  // ترتيب تنازلي حسب التاريخ (أحدث أولاً)
  const sortedTodayOrders = useMemo(() => {
    return [...todayOrders].sort((a, b) => 
      new Date(b.orderDate) - new Date(a.orderDate)
    );
  }, [todayOrders]);

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-400">
        جاري تحميل طلبات اليوم...
      </div>
    );
  }

  if (sortedTodayOrders.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg font-medium">لا توجد طلبات اليوم حتى الآن</p>
        <p className="text-sm mt-2">الطلبات الجديدة ستظهر هنا تلقائيًا</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-2">
      <h3 className="text-[#f5f5f5] text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-[#e2bc15]">طلبات اليوم</span>
        <span className="text-gray-500 text-base">({sortedTodayOrders.length})</span>
      </h3>

      <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
        {sortedTodayOrders.map((order) => (
          <div
            key={order._id}
            className="bg-[#1f1f1f] p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-[#252525] transition-all"
          >
            {/* Left - Customer & Table */}
            <div className="flex-1">
              <p className="text-[#f5f5f5] font-semibold">
                {order.customerDetails?.name || "ضيف"}
              </p>
              <p className="text-sm text-gray-400">
                {order.table?.tableNo 
                  ? `طاولة ${order.table.tableNo}` 
                  : "بدون طاولة"}
              </p>
            </div>

            {/* Right - Total & Time */}
            <div className="text-right">
              <p className="text-[#e2bc15] font-bold text-lg">
                ج.م{order.bills?.totalWithTax?.toFixed(2) || order.bills?.total?.toFixed(2) || "0.00"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {order.orderDate && new Date(order.orderDate).toLocaleString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
                {" • "}
                {new Date(order.orderDate).toLocaleDateString("ar-EG", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentOrders;