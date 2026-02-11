import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPayments } from "../../https/index"; // ✅ استيراد من https/index
import { enqueueSnackbar } from "notistack";

const InvoicesTable = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "Paid", // عرض المدفوعة فقط
    paymentMethod: "",
    search: ""
  });

  // ✅ جلب الدفعات من Payment Collection
  const { data, isLoading, isError } = useQuery({
    queryKey: ["payments", "invoices", page, filters],
    queryFn: () => {
      const params = {
        page,
        limit: 20,
        status: filters.status,
        ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
        ...(filters.search && { search: filters.search })
      };

      return getPayments(params);
    },
    onError: (err) => {
      console.error("Error fetching payments:", err);
      enqueueSnackbar("فشل في تحميل الفواتير", { variant: "error" });
    }
  });

  // ✅ استخراج البيانات
  const payments = data?.data?.data || data?.data || [];
  const totalPages = data?.data?.pages || data?.pages || 1;
  const totalCount = data?.data?.total || data?.total || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-400">جاري تحميل الفواتير...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center p-8">
        خطأ في تحميل الفواتير
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header & Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          الفواتير ({totalCount})
        </h2>

        {/* Filters */}
        <div className="flex gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="ابحث بكود الفاتورة أو اسم العميل..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="bg-[#262626] text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
          />

          {/* Payment Method Filter */}
          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
            className="bg-[#262626] text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none"
          >
            <option value="">كل الطرق</option>
            <option value="Cash">نقدي</option>
            <option value="Card">بطاقة</option>
            <option value="Wallet">محفظة</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="bg-[#262626] text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none"
          >
            <option value="">كل الحالات</option>
            <option value="Paid">مدفوع</option>
            <option value="Refunded">مسترد</option>
            <option value="Cancelled">ملغي</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {payments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">لا توجد فواتير</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="w-full text-left text-white">
              <thead className="bg-[#262626] border-b border-gray-700">
                <tr>
                  <th className="p-4 font-semibold">كود الفاتورة</th>
                  <th className="p-4 font-semibold">العميل</th>
                  <th className="p-4 font-semibold">الطاولة</th>
                  <th className="p-4 font-semibold">العناصر</th>
                  <th className="p-4 font-semibold">طريقة الدفع</th>
                  <th className="p-4 font-semibold">الحالة</th>
                  <th className="p-4 font-semibold">المبلغ الإجمالي</th>
                  <th className="p-4 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {payments.map(payment => (
                  <tr 
                    key={payment._id} 
                    className="hover:bg-[#1f1f1f] transition-colors"
                  >
                    {/* Invoice Code */}
                    <td className="p-4 font-mono text-blue-400 font-semibold">
                      {payment.orderCode || payment._id.slice(-6).toUpperCase()}
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <div>
                        <p className="font-medium">
                          {payment.customerDetails?.name || "ضيف"}
                        </p>
                        {payment.customerDetails?.phone && (
                          <p className="text-sm text-gray-400">
                            {payment.customerDetails.phone}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Table */}
                    <td className="p-4">
                      {payment.table ? (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                          {payment.table.tableNo || payment.table.name}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>

                    {/* Items Count */}
                    <td className="p-4">
                      <span className="text-gray-300">
                        {payment.items?.length || 0} عنصر
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        payment.paymentMethod === "Cash" 
                          ? "bg-green-500/20 text-green-400" 
                          : payment.paymentMethod === "Card"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-purple-500/20 text-purple-400"
                      }`}>
                        {payment.paymentMethod === "Cash" ? "💵 نقدي" :
                         payment.paymentMethod === "Card" ? "💳 بطاقة" :
                         payment.paymentMethod === "Wallet" ? "📱 محفظة" :
                         payment.paymentMethod || "غير محدد"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        payment.status === "Paid" 
                          ? "bg-green-500/20 text-green-400" 
                          : payment.status === "Refunded"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {payment.status === "Paid" ? "✅ مدفوع" :
                         payment.status === "Refunded" ? "🔄 مسترد" :
                         payment.status === "Cancelled" ? "❌ ملغي" :
                         payment.status || "غير محدد"}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-green-400">
                          {payment.bills?.total?.toFixed(2) || "0.00"} جنيه
                        </p>
                        {payment.bills?.tax > 0 && (
                          <p className="text-xs text-gray-400">
                            شامل {payment.bills.tax.toFixed(2)} ضريبة
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-sm text-gray-400">
                      {payment.paidAt 
                        ? new Date(payment.paidAt).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : "غير متوفر"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-[#262626] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#333]"
              >
                السابق
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 rounded ${
                        page === pageNum 
                          ? "bg-blue-600 text-white" 
                          : "bg-[#262626] text-gray-400 hover:bg-[#333]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-[#262626] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#333]"
              >
                التالي
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="mt-6 p-4 bg-[#262626] rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">إجمالي الفواتير:</span>
              <span className="font-bold text-white">{totalCount}</span>
            </div>
            {payments.length > 0 && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-400">إجمالي المبلغ في هذه الصفحة:</span>
                <span className="font-bold text-green-400">
                  {payments.reduce((sum, p) => sum + (p.bills?.total || 0), 0).toFixed(2)} جنيه
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InvoicesTable;