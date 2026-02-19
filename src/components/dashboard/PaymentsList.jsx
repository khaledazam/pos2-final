import React, { useState, useEffect } from "react";
import { FaSearch, FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getPayments } from "../../https/index";
import { useMemo } from "react";

const PaymentsList = ({ onViewInvoice }) => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    paymentMethod: "",
    search: "",
    startDate: "",
    endDate: "",
  });

  const [groupBy, setGroupBy] = useState("day");
  const [expandedGroups, setExpandedGroups] = useState({});

  // للـ Modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    setFilters({
      status: "",
      paymentMethod: "",
      search: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  }, []);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["payments", page, filters],
    queryFn: () => {
      const params = {
        page,
        limit: 50,
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      };
      return getPayments(params);
    },
    staleTime: 0,
  });

  const payments = data?.data?.data || data?.data || [];
  const totalPages = data?.data?.pages || data?.pages || 1;
  const totalCount = data?.data?.total || data?.total || 0;

  // Grouping Logic (نفس اللي قبل كده)
  const groupedPayments = useMemo(() => {
    if (!Array.isArray(payments) || payments.length === 0) return {};

    const groups = {};

    payments.forEach((payment) => {
      const dateField = payment.paidAt || payment.createdAt;
      if (!dateField) return;

      const date = new Date(dateField);
      let key = groupBy === "day"
        ? date.toISOString().split("T")[0]
        : date.toLocaleDateString("ar-EG", { year: "numeric", month: "long" });

      if (!groups[key]) groups[key] = [];
      groups[key].push(payment);
    });

    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => new Date(b) - new Date(a))
    );
  }, [payments, groupBy]);

  const filteredGroupedPayments = useMemo(() => {
    if (!filters.search.trim()) return groupedPayments;

    const searchTerm = filters.search.toLowerCase();
    const result = {};

    Object.entries(groupedPayments).forEach(([groupKey, items]) => {
      const matched = items.filter((p) => {
        const name = p.customerDetails?.name?.toLowerCase() || "";
        const code = p.orderCode?.toLowerCase() || "";
        return name.includes(searchTerm) || code.includes(searchTerm);
      });

      if (matched.length > 0) result[groupKey] = matched;
    });

    return result;
  }, [groupedPayments, filters.search]);

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: prev[groupKey] !== false ? false : true,
    }));
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

  const handleResetFilters = () => {
    setFilters({
      status: "",
      paymentMethod: "",
      search: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  // فتح المودال مع الدفعة المختارة
  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowInvoiceModal(true);
  };

  if (error) {
    return (
      <div className="text-red-500 text-center p-8">
        خطأ في تحميل الدفعات: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto bg-[#1f1f1f] p-8 rounded-[2rem] border border-[#333] shadow-2xl relative">
      {/* Header + Group Tabs */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#333] pb-6">
        <div>
          <h2 className="text-[#f5f5f5] text-3xl font-black flex items-center gap-3">
            <span className="w-4 h-10 bg-[#e2bc15] rounded-full"></span>
            كل الدفعات
          </h2>
          <p className="text-[#ababab] text-sm mt-1">
            {totalCount} دفعة
          </p>
        </div>

        <div className="flex gap-2 bg-[#1f1f1f] rounded-lg p-1">
          <button
            onClick={() => setGroupBy("day")}
            className={`px-4 py-2 text-sm rounded-md transition ${
              groupBy === "day" ? "bg-[#e2bc15] text-black" : "text-gray-400 hover:text-white"
            }`}
          >
            حسب اليوم
          </button>
          <button
            onClick={() => setGroupBy("month")}
            className={`px-4 py-2 text-sm rounded-md transition ${
              groupBy === "month" ? "bg-[#e2bc15] text-black" : "text-gray-400 hover:text-white"
            }`}
          >
            حسب الشهر
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* ... باقي الفلاتر كما هي ... */}
        <input
          type="text"
          placeholder="ابحث بكود الفاتورة أو اسم العميل..."
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          className="bg-[#262626] text-[#f5f5f5] px-4 py-3 rounded-2xl border-2 border-[#333] focus:outline-none focus:border-[#e2bc15] placeholder-[#555] font-bold"
        />
        {/* ... باقي select و inputs ... */}
      </div>

      <div className="mb-6 flex justify-end">
        <button
          onClick={handleResetFilters}
          className="bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#e2bc15] px-6 py-2 rounded-xl transition-all font-black"
        >
          إعادة تعيين الفلاتر
        </button>
      </div>

      {/* المحتوى الرئيسي */}
      {isLoading || isFetching ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e2bc15]"></div>
          <p className="ml-4 text-[#ababab] font-bold">جاري تحميل الدفعات...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center p-8 text-gray-400">
          <p className="mb-4">لا توجد دفعات في الداتابيز</p>
          <button
            onClick={handleResetFilters}
            className="bg-[#e2bc15] text-black px-6 py-2 rounded-lg font-bold"
          >
            تحديث
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(filteredGroupedPayments).map(([groupKey, groupPayments]) => {
            const isGroupOpen = expandedGroups[groupKey] !== false;

            return (
              <div key={groupKey} className="mb-8">
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className="w-full flex items-center justify-between bg-[#222] hover:bg-[#2a2a2a] px-6 py-4 rounded-xl transition-colors mb-3"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-[#e2bc15] text-xl font-bold">
                      {formatGroupTitle(groupKey)}
                    </h3>
                    <span className="text-gray-500 text-lg">
                      ({groupPayments.length})
                    </span>
                  </div>
                  {isGroupOpen ? <FaChevronUp /> : <FaChevronDown />}
                </button>

                {isGroupOpen && (
                  <div className="overflow-x-auto rounded-2xl border border-[#333]">
                    <table className="w-full text-left text-[#f5f5f5]">
                      <thead className="bg-[#262626] text-[#ababab]">
                        <tr>
                          <th className="p-5 font-black text-lg">كود الفاتورة</th>
                          <th className="p-5 font-black text-lg">العميل</th>
                          <th className="p-5 font-black text-lg">الطاولة</th>
                          <th className="p-5 font-black text-lg">عدد العناصر</th>
                          <th className="p-5 font-black text-lg">الإجمالي</th>
                          <th className="p-5 font-black text-lg">طريقة الدفع</th>
                          <th className="p-5 font-black text-lg">الحالة</th>
                          <th className="p-5 font-black text-lg">تاريخ الدفع</th>
                          <th className="p-5 font-black text-lg text-center">عرض</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#333]">
                        {groupPayments.map((payment) => (
                          <tr
                            key={payment._id}
                            className="hover:bg-[#2a2a2a] transition-all duration-300"
                          >
                            <td className="p-5 font-mono text-[#e2bc15] font-black">
                              {payment.orderCode || "غير متوفر"}
                            </td>
                            <td className="p-5">{payment.customerDetails?.name || "ضيف"}</td>
                            <td className="p-5">
                              {payment.table?.name || payment.table?.tableNo || "-"}
                            </td>
                            <td className="p-5">{payment.items?.length || 0}</td>
                            <td className="p-5 text-green-400 font-bold">
                              ج.م{payment.bills?.total?.toFixed(2) || "0.00"}
                            </td>
                            <td className="p-5">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-black ${
                                  payment.paymentMethod === "Cash"
                                    ? "bg-green-900/30 text-green-300"
                                    : "bg-blue-900/30 text-blue-300"
                                }`}
                              >
                                {payment.paymentMethod || "غير محدد"}
                              </span>
                            </td>
                            <td className="p-5">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-black ${
                                  payment.status === "Paid"
                                    ? "bg-green-900/30 text-green-300"
                                    : "bg-red-900/30 text-red-300"
                                }`}
                              >
                                {payment.status || "غير محدد"}
                              </span>
                            </td>
                            <td className="p-5 text-sm">
                              {payment.paidAt
                                ? new Date(payment.paidAt).toLocaleString("ar-EG")
                                : "غير متوفر"}
                            </td>
                            <td className="p-5 text-center">
                              <button
                                onClick={() => handleViewPayment(payment)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm transition"
                              >
                                عرض
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ────────────────────────────────────────────────
          Modal لعرض محتويات الفاتورة
      ──────────────────────────────────────────────── */}
      {showInvoiceModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 md:p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-[#444] relative shadow-2xl">
            {/* زر الإغلاق */}
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl transition z-10"
            >
              <FaTimes />
            </button>

            {/* عنوان الفاتورة */}
            <h2 className="text-2xl md:text-3xl font-black text-[#e2bc15] mb-6 text-center md:text-left">
              فاتورة رقم {selectedPayment.orderCode || selectedPayment._id.slice(-6)}
            </h2>

            {/* معلومات العميل */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-[#f5f5f5] mb-2">بيانات العميل</h3>
                <p className="text-gray-300">
                  الاسم: <span className="font-bold">{selectedPayment.customerDetails?.name || "ضيف"}</span>
                </p>
                {selectedPayment.customerDetails?.phone && (
                  <p className="text-gray-300">
                    الهاتف: <span className="font-bold">{selectedPayment.customerDetails.phone}</span>
                  </p>
                )}
                <p className="text-gray-300">
                  عدد الأشخاص: <span className="font-bold">{selectedPayment.customerDetails?.guests || 1}</span>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#f5f5f5] mb-2">معلومات الدفع</h3>
                <p className="text-gray-300">
                  طريقة الدفع: <span className="font-bold">{selectedPayment.paymentMethod || "غير محدد"}</span>
                </p>
                <p className="text-gray-300">
                  الحالة: <span className={`font-bold ${selectedPayment.status === "Paid" ? "text-green-400" : "text-red-400"}`}>
                    {selectedPayment.status || "غير محدد"}
                  </span>
                </p>
                <p className="text-gray-300">
                  تاريخ الدفع: <span className="font-bold">
                    {selectedPayment.paidAt
                      ? new Date(selectedPayment.paidAt).toLocaleString("ar-EG")
                      : "غير متوفر"}
                  </span>
                </p>
              </div>
            </div>

            {/* جدول المنتجات */}
            <h3 className="text-xl font-bold text-[#f5f5f5] mb-4">المنتجات</h3>
            <div className="overflow-x-auto mb-8 rounded-xl border border-[#333]">
              <table className="w-full text-left">
                <thead className="bg-[#262626]">
                  <tr>
                    <th className="p-4 font-black">المنتج</th>
                    <th className="p-4 font-black text-center">الكمية</th>
                    <th className="p-4 font-black text-right">سعر الوحدة</th>
                    <th className="p-4 font-black text-right">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333]">
                  {selectedPayment.items?.length > 0 ? (
                    selectedPayment.items.map((item, index) => (
                      <tr key={index} className="hover:bg-[#2a2a2a]">
                        <td className="p-4">
                          {item?.item?.name || item?.name || "منتج غير معروف"}
                        </td>
                        <td className="p-4 text-center">{item.quantity || 1}</td>
                        <td className="p-4 text-right">
                          ج.م{item.unitPrice?.toFixed(2) || "0.00"}
                        </td>
                        <td className="p-4 text-right font-bold text-green-400">
                          ج.م{(item.unitPrice * (item.quantity || 1)).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-500">
                        لا توجد منتجات في هذه الفاتورة
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* الإجماليات */}
            <div className="bg-[#222] p-6 rounded-xl mb-8">
              <div className="flex justify-between text-lg mb-3">
                <span className="text-gray-300">المجموع قبل الضريبة:</span>
                <span className="text-[#f5f5f5] font-bold">
                  ج.م{selectedPayment.bills?.total?.toFixed(2) || "0.00"}
                </span>
              </div>

              {selectedPayment.bills?.tax > 0 && (
                <div className="flex justify-between text-lg mb-3">
                  <span className="text-gray-300">الضريبة:</span>
                  <span className="text-[#f5f5f5] font-bold">
                    ج.م{selectedPayment.bills?.tax?.toFixed(2) || "0.00"}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-2xl font-black pt-4 border-t border-[#444]">
                <span className="text-white">الإجمالي الكلي:</span>
                <span className="text-[#e2bc15]">
                  ج.م{selectedPayment.bills?.totalWithTax?.toFixed(2) ||
                    selectedPayment.bills?.total?.toFixed(2) ||
                    "0.00"}
                </span>
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  // هنا ممكن تضيف منطق الطباعة
                  window.print();
                }}
                className="px-8 py-3 bg-[#e2bc15] hover:bg-yellow-400 text-black font-bold rounded-xl transition shadow-lg"
              >
                طباعة الفاتورة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsList;