import React, { useState, useMemo } from "react";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders, deleteOrder } from "../../https/index";

const RecentOrders = () => {
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [groupBy, setGroupBy] = useState("day"); // "day" | "month"
  const [expandedGroups, setExpandedGroups] = useState({}); // {} → كل المجموعات مفتوحة افتراضيًا

  const queryClient = useQueryClient();

  const { data: resData, isError, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  React.useEffect(() => {
    if (isError) {
      enqueueSnackbar("حدث خطأ أثناء تحميل الطلبات!", { variant: "error" });
    }
  }, [isError]);

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const res = await deleteOrder(orderId);
      return res;
    },
    onSuccess: () => {
      enqueueSnackbar("تم حذف الطلب وتحرير الطاولة", { variant: "success" });
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["tables"]);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "فشل حذف الطلب";
      enqueueSnackbar(msg, { variant: "error" });
    },
    onSettled: () => setProcessingId(null),
  });

  const handleDeleteOrder = (order) => {
    setProcessingId(order._id);
    deleteOrderMutation.mutate(order._id);
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: prev[groupKey] !== false ? false : true,
    }));
  };

  // استخراج الطلبات
  const ordersArray = useMemo(() => {
    if (!resData) return [];
    return resData.data?.data || resData.data || (Array.isArray(resData) ? resData : []);
  }, [resData]);

  // تجميع الطلبات حسب اليوم أو الشهر
  const groupedOrders = useMemo(() => {
    if (!Array.isArray(ordersArray) || ordersArray.length === 0) return {};

    const groups = {};

    ordersArray.forEach((order) => {
      if (!order?.orderDate) return;

      const date = new Date(order.orderDate);
      let key;

      if (groupBy === "day") {
        key = date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else {
        key = date.toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "long",
        });
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(order);
    });

    // ترتيب تنازلي (أحدث أولاً)
    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => new Date(b) - new Date(a))
    );
  }, [ordersArray, groupBy]);

  // تصفية بعد التجميع
  const filteredGroupedOrders = useMemo(() => {
    if (!search.trim()) return groupedOrders;

    const searchTerm = search.toLowerCase();
    const result = {};

    Object.entries(groupedOrders).forEach(([groupKey, orders]) => {
      const matched = orders.filter((order) => {
        const name = order?.customerDetails?.name?.toLowerCase() || "";
        const id = order?._id?.toLowerCase() || "";
        return name.includes(searchTerm) || id.includes(searchTerm);
      });

      if (matched.length > 0) {
        result[groupKey] = matched;
      }
    });

    return result;
  }, [groupedOrders, search]);

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-500/20 text-yellow-400",
      "In Progress": "bg-blue-500/20 text-blue-400",
      Ready: "bg-green-500/20 text-green-400",
      Completed: "bg-purple-500/20 text-purple-400",
      Cancelled: "bg-red-500/20 text-red-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  const formatGroupTitle = (key) => {
    if (groupBy === "day") {
      const date = new Date(key);
      return date.toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return key;
  };

  return (
    <div className="px-8 mt-6">
      <div className="bg-[#1a1a1a] w-full rounded-lg">
        {/* Header + Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6 py-4">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
            الطلبات الأخيرة
          </h1>

          <div className="flex gap-2 bg-[#1f1f1f] rounded-lg p-1">
            <button
              onClick={() => setGroupBy("day")}
              className={`px-4 py-2 text-sm rounded-md transition ${
                groupBy === "day"
                  ? "bg-[#025cca] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              حسب اليوم
            </button>
            <button
              onClick={() => setGroupBy("month")}
              className={`px-4 py-2 text-sm rounded-md transition ${
                groupBy === "month"
                  ? "bg-[#025cca] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              حسب الشهر
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-6 py-4 mx-6">
          <FaSearch className="text-[#f5f5f5]" />
          <input
            type="text"
            placeholder="ابحث باسم العميل أو رقم الطلب"
            className="bg-transparent outline-none text-[#f5f5f5] w-full placeholder-gray-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Orders List */}
        <div className="mt-4 px-6 overflow-y-auto max-h-[500px] scrollbar-hide pb-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 text-sm">جاري تحميل الطلبات...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
              <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 font-medium">فشل تحميل الطلبات</p>
            </div>
          ) : Object.keys(filteredGroupedOrders).length > 0 ? (
            Object.entries(filteredGroupedOrders).map(([groupKey, orders]) => {
              const isGroupOpen = expandedGroups[groupKey] !== false;

              return (
                <div key={groupKey} className="mb-6">
                  {/* عنوان المجموعة */}
                  <button
                    onClick={() => toggleGroup(groupKey)}
                    className="w-full flex items-center justify-between bg-[#222] hover:bg-[#2a2a2a] px-5 py-4 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <h2 className="text-[#e2bc15] text-lg font-bold">
                        {formatGroupTitle(groupKey)}
                      </h2>
                      <span className="text-gray-500 text-base">
                        ({orders.length})
                      </span>
                    </div>

                    {isGroupOpen ? (
                      <FaChevronUp className="text-gray-400" />
                    ) : (
                      <FaChevronDown className="text-gray-400" />
                    )}
                  </button>

                  {/* محتوى الطلبات */}
                  {isGroupOpen && (
                    <div className="mt-3 space-y-3">
                      {orders.map((order) => {
                        if (!order?._id) return null;

                        const isProcessing = processingId === order._id;
                        const isExpanded = expandedOrder === order._id;

                        return (
                          <div
                            key={order._id}
                            className="bg-[#1f1f1f] rounded-xl overflow-hidden"
                          >
                            <div className="p-4 hover:bg-[#252525] transition-colors duration-200">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[#025cca] font-bold text-sm">
                                      #{order._id?.slice(-6)?.toUpperCase() || "N/A"}
                                    </span>

                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                        order.orderStatus
                                      )}`}
                                    >
                                      {order.orderStatus || "غير معروف"}
                                    </span>

                                    <button
                                      onClick={() => toggleExpand(order._id)}
                                      className="ml-auto p-2 hover:bg-[#333] rounded-lg transition-colors"
                                    >
                                      {isExpanded ? (
                                        <FaChevronUp className="text-gray-400" />
                                      ) : (
                                        <FaChevronDown className="text-gray-400" />
                                      )}
                                    </button>
                                  </div>

                                  <h3 className="text-[#f5f5f5] font-semibold mb-1">
                                    {order.customerDetails?.name || "ضيف"}
                                  </h3>

                                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                                    <span>
                                      {order.items?.length || 0}{" "}
                                      {order.items?.length === 1 ? "منتج" : "منتجات"}
                                    </span>

                                    {order.table && (
                                      <span>• طاولة {order.table.tableNo || order.table.name}</span>
                                    )}

                                    {order.orderDate && (
                                      <span>
                                        •{" "}
                                        {new Date(order.orderDate).toLocaleTimeString("ar-EG", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-baseline gap-2">
                                    <p className="text-[#f5f5f5] font-bold text-xl">
                                      {order.bills?.totalWithTax?.toFixed(2) ||
                                        order.bills?.total?.toFixed(2) ||
                                        "0.00"}{" "}
                                      ج.م
                                    </p>
                                    {order.bills?.tax > 0 && (
                                      <p className="text-gray-500 text-xs">
                                        (شامل ضريبة {order.bills.tax.toFixed(2)} ج.م)
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                  <button
                                    onClick={() => handleDeleteOrder(order)}
                                    disabled={isProcessing || deleteOrderMutation.isPending}
                                    className={`
                                      px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider
                                      transition-all duration-200 flex items-center gap-2
                                      ${
                                        isProcessing
                                          ? "bg-gray-600 cursor-wait"
                                          : "bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95"
                                      }
                                      text-white shadow-lg
                                      disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                  >
                                    {isProcessing ? (
                                      <>
                                        <svg
                                          className="animate-spin h-4 w-4"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                          />
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          />
                                        </svg>
                                        جاري الحذف...
                                      </>
                                    ) : (
                                      <>🗑️ حذف</>
                                    )}
                                  </button>

                                  <p className="text-xs text-gray-500 text-right max-w-[150px]">
                                    اضغط السهم لعرض التفاصيل
                                  </p>
                                </div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="border-t border-[#333] bg-[#1a1a1a] p-4 animate-slideDown">
                                <h4 className="text-[#f5f5f5] font-semibold mb-3 flex items-center gap-2">
                                  <span>📋</span>
                                  تفاصيل الطلب
                                </h4>

                                <div className="space-y-2">
                                  {order.items && order.items.length > 0 ? (
                                    order.items.map((item, index) => (
                                      <div
                                        key={index}
                                        className="flex justify-between items-center bg-[#1f1f1f] p-3 rounded-lg"
                                      >
                                        <div className="flex-1">
                                          <p className="text-[#f5f5f5] font-medium">
                                            {item?.item?.name ||
                                              item?.name ||
                                              item?.product?.name ||
                                              item?.title ||
                                              "منتج غير معروف"}
                                          </p>
                                          <p className="text-gray-400 text-xs">
                                            {item.unitPrice?.toFixed(2)} ج.م × {item.quantity}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-[#f5f5f5] font-bold">
                                            {(item.unitPrice * item.quantity).toFixed(2)} ج.م
                                          </p>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-gray-500 text-center py-4">
                                      لا توجد منتجات في هذا الطلب
                                    </p>
                                  )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-[#333] space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">الإجمالي قبل الضريبة:</span>
                                    <span className="text-[#f5f5f5]">
                                      {order.bills?.total?.toFixed(2) || "0.00"} ج.م
                                    </span>
                                  </div>

                                  {order.bills?.tax > 0 && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-400">الضريبة:</span>
                                      <span className="text-[#f5f5f5]">
                                        {order.bills.tax.toFixed(2)} ج.م
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#333]">
                                    <span className="text-[#f5f5f5]">الإجمالي الكلي:</span>
                                    <span className="text-green-400">
                                      {(order.bills?.totalWithTax ||
                                        order.bills?.total ||
                                        0
                                      ).toFixed(2)}{" "}
                                      ج.م
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-[#333]">
                                  <h5 className="text-gray-400 text-sm font-semibold mb-2">
                                    بيانات العميل
                                  </h5>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-gray-500">الاسم:</span>
                                      <span className="text-[#f5f5f5] ml-2">
                                        {order.customerDetails?.name || "ضيف"}
                                      </span>
                                    </div>
                                    {order.customerDetails?.phone && (
                                      <div>
                                        <span className="text-gray-500">الهاتف:</span>
                                        <span className="text-[#f5f5f5] ml-2">
                                          {order.customerDetails.phone}
                                        </span>
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-gray-500">عدد الأشخاص:</span>
                                      <span className="text-[#f5f5f5] ml-2">
                                        {order.customerDetails?.guests || 1}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">طريقة الدفع:</span>
                                      <span className="text-[#f5f5f5] ml-2">
                                        {order.paymentMethod || "كاش"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
              <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-400 font-medium">
                {search ? `لا توجد طلبات مطابقة لـ "${search}"` : "لا توجد طلبات بعد"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;