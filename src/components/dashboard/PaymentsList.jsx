import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPayments } from "../../https/index"; // ✅ استخدام axiosWrapper
import { enqueueSnackbar } from "notistack";

const PaymentsList = ({ onViewInvoice }) => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    paymentMethod: "",
    search: "",
    startDate: "",
    endDate: ""
  });

  // Reset filters on mount to show ALL payments by default
  useEffect(() => {
    console.log("صفحة الدفعات فتحت - عرض كل الدفعات بدون فلاتر");
    setFilters({
      status: "",
      paymentMethod: "",
      search: "",
      startDate: "",
      endDate: ""
    });
    setPage(1);
  }, []);

  // ✅ استخدام getPayments من https/index.js
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["payments", page, filters],
    queryFn: () => {
      console.log("جاري جلب الدفعات مع الفلاتر:", filters);

      // ✅ تجهيز الـ params
      const params = {
        page,
        limit: 50,
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      };

      console.log("Params المرسلة:", params);

      // ✅ استدعاء الـ API عن طريق axiosWrapper
      return getPayments(params);
    },
    staleTime: 0,
    onSuccess: (data) => {
      console.log("الرد الكامل من /api/payments:", data);
      console.log("عدد الدفعات في الرد:", data?.data?.data?.length || 0);
    },
    onError: (err) => {
      console.error("خطأ في جلب الدفعات:", err);
      enqueueSnackbar("فشل في تحميل الدفعات", { variant: "error" });
    }
  });

  // ✅ استخراج البيانات من الـ response
  // axiosWrapper يرجع response.data مباشرة
  const payments = data?.data?.data || data?.data || [];
  const totalPages = data?.data?.pages || data?.pages || 1;
  const totalCount = data?.data?.total || data?.total || 0;

  console.log("الدفعات اللي هتتعرض في الجدول:", payments);
  console.log("عدد الدفعات النهائي:", payments.length);

  const handleResetFilters = () => {
    console.log("Reset Filters - عرض الكل");
    setFilters({
      status: "",
      paymentMethod: "",
      search: "",
      startDate: "",
      endDate: ""
    });
    setPage(1);
  };

  if (error) {
    return (
      <div className="text-red-500 text-center p-8">
        خطأ في تحميل الدفعات: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto bg-[#1f1f1f] p-8 rounded-[2rem] border border-[#333] shadow-2xl">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center border-b border-[#333] pb-6">
        <div>
          <h2 className="text-[#f5f5f5] text-3xl font-black flex items-center gap-3">
            <span className="w-4 h-10 bg-[#e2bc15] rounded-full"></span>
            كل الدفعات
          </h2>
          <p className="text-[#ababab] text-sm mt-1">
            {totalCount} دفعة (من جدول Payment)
          </p>
        </div>
        
        <button
          onClick={handleResetFilters}
          className="bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ababab] hover:text-[#e2bc15] px-4 py-2 rounded-xl transition-all font-black"
        >
          عرض الكل
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="ابحث بكود الفاتورة أو اسم العميل..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="bg-[#262626] text-[#f5f5f5] px-4 py-3 rounded-2xl border-2 border-[#333] focus:outline-none focus:border-[#e2bc15] placeholder-[#555] font-bold"
        />

        {/* Payment Method */}
        <select
          value={filters.paymentMethod}
          onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
          className="bg-[#262626] text-[#f5f5f5] px-4 py-3 rounded-2xl border-2 border-[#333] focus:outline-none focus:border-[#e2bc15] font-bold"
        >
          <option value="">كل طرق الدفع</option>
          <option value="Cash">💵 كاش</option>
          <option value="Card">💳 كارت</option>
          <option value="Wallet">📱 محفظة</option>
        </select>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="bg-[#262626] text-[#f5f5f5] px-4 py-3 rounded-2xl border-2 border-[#333] focus:outline-none focus:border-[#e2bc15] font-bold"
        >
          <option value="">كل الحالات</option>
          <option value="Paid">✅ مدفوع</option>
          <option value="Refunded">🔄 مسترد</option>
          <option value="Cancelled">❌ ملغي</option>
        </select>

        {/* Start Date */}
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
          className="bg-[#262626] text-[#f5f5f5] px-4 py-3 rounded-2xl border-2 border-[#333] focus:outline-none focus:border-[#e2bc15] font-bold"
        />

        {/* End Date */}
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
          className="bg-[#262626] text-[#f5f5f5] px-4 py-3 rounded-2xl border-2 border-[#333] focus:outline-none focus:border-[#e2bc15] font-bold"
        />
      </div>

      {/* Loading / Error / Empty State */}
      {isLoading || isFetching ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e2bc15]"></div>
          <p className="ml-4 text-[#ababab] font-bold">جاري تحميل كل الدفعات...</p>
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
        <>
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
                {payments.map((payment) => (
                  <tr 
                    key={payment._id} 
                    className="hover:bg-[#2a2a2a] transition-all duration-300"
                  >
                    <td className="p-5 font-mono text-[#e2bc15] font-black">
                      {payment.orderCode || "غير متوفر"}
                    </td>

                    <td className="p-5">
                      {payment.customerDetails?.name || "ضيف"}
                    </td>

                    <td className="p-5">
                      {payment.table?.name || payment.table?.tableNo || "-"}
                    </td>

                    <td className="p-5">
                      {payment.items?.length || 0}
                    </td>

                    <td className="p-5 text-green-400 font-bold">
                      ${payment.bills?.total?.toFixed(2) || "0.00"}
                    </td>

                    <td className="p-5">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-black ${
                        payment.paymentMethod === "Cash" ? "bg-green-900/30 text-green-300" : "bg-blue-900/30 text-blue-300"
                      }`}>
                        {payment.paymentMethod || "غير محدد"}
                      </span>
                    </td>

                    <td className="p-5">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-black ${
                        payment.status === "Paid" ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"
                      }`}>
                        {payment.status || "غير محدد"}
                      </span>
                    </td>

                    <td className="p-5 text-sm">
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleString("ar-EG") : "غير متوفر"}
                    </td>

                    <td className="p-5 text-center">
                      <button
                        onClick={() => onViewInvoice?.(payment._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm"
                      >
                        عرض
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-[#262626] rounded disabled:opacity-50"
              >
                السابق
              </button>
              <span className="px-4 py-2 text-[#f5f5f5]">
                صفحة {page} من {totalPages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-[#262626] rounded disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentsList;