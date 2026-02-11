import React, { useEffect, useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaTimes, FaPrint, FaMoneyBillWave } from "react-icons/fa";
import { enqueueSnackbar } from "notistack";

const InvoiceModal = ({ orderId, onClose }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  console.log("InvoiceModal opened with orderId:", orderId); // ← Log 1: تأكد من الـ orderId اللي جاي

  // ===== Fetch invoice from Payments endpoint =====
  useEffect(() => {
    if (!orderId) {
      console.log("No orderId provided, skipping fetch");
      return;
    }

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        console.log("Fetching invoice from: /api/payments/order/" + orderId); // ← Log 2: تأكد من الرابط اللي بيتم استدعاؤه

        const { data } = await axios.get(
          `http://localhost:8000/api/payments/order/${orderId}`
        );

        console.log("Full API response from /api/payments/order:", data); // ← Log 3: الرد الكامل من الباك
        console.log("Data.data (الداتا اللي هتتحط في invoice):", data.data); // ← Log 4: الداتا الفعلية

        setInvoice(data.data);
      } catch (err) {
        console.error("Error fetching payment invoice:", err.response?.data || err.message);
        enqueueSnackbar("فشل في جلب بيانات الفاتورة", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [orderId]);

  // ===== Add to payment mutation =====
  const addToPaymentMutation = useMutation({
    mutationFn: async ({ orderId }) => {
      console.log("Sending addToPayment request with orderId:", orderId);
      const { data } = await axios.post(
        "http://localhost:8000/api/payments",
        { orderId }
      );
      console.log("addToPayment response:", data);
      return data.data;
    },
    onSuccess: () => {
      console.log("addToPayment succeeded - invalidating orders only");
      queryClient.invalidateQueries(["orders"]);
      // ماتعملش invalidate لـ payments هنا
      enqueueSnackbar("تم إضافة الدفع بنجاح", { variant: "success" });
      onClose();
    },
    onError: (err) => {
      console.error("Add to payment error:", err);
      enqueueSnackbar("فشل في إضافة الدفع", { variant: "error" });
    },
  });

  const handleAddToPayment = () => {
    addToPaymentMutation.mutate({ orderId });
  };

  const handlePrint = () => {
    window.print();
  };

 
  if (!orderId) {
  console.log("No orderId, returning null");
  return null;
}
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
        >
          <FaTimes />
        </button>

        <h2 className="text-xl font-bold mb-4">فاتورة الطلب</h2>

        {loading && <p className="text-center text-gray-600">جاري تحميل الفاتورة...</p>}

        {!loading && invoice ? (
          <>
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>كود الفاتورة:</strong> {invoice.orderCode || "غير متوفر"}</p>
              <p>
                <strong>تاريخ الدفع:</strong>{" "}
                {invoice.paidAt ? new Date(invoice.paidAt).toLocaleString("ar-EG") : "غير متوفر"}
              </p>
              <p>
                <strong>الحالة:</strong>{" "}
                <span className={`font-bold ${invoice.status === "Paid" ? "text-green-600" : "text-red-600"}`}>
                  {invoice.status || "غير محدد"}
                </span>
              </p>
            </div>

            <hr className="my-4 border-gray-300" />

            {/* Items */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800">العناصر</h3>
              {invoice.items?.length > 0 ? (
                invoice.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name || "منتج غير معروف"} × {item.quantity || 0}</span>
                    <span>{(item.total || (item.quantity * item.unitPrice) || 0).toFixed(2)} جنيه</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">لا توجد عناصر في الفاتورة</p>
              )}
            </div>

            <hr className="my-4 border-gray-300" />

            {/* Bills */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>الإجمالي الفرعي:</span>
                <span>{invoice.bills?.subtotal?.toFixed(2) || "0.00"} جنيه</span>
              </div>
              {invoice.bills?.tax > 0 && (
                <div className="flex justify-between">
                  <span>الضريبة:</span>
                  <span>{invoice.bills?.tax?.toFixed(2) || "0.00"} جنيه</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg text-green-700">
                <span>الإجمالي الكلي:</span>
                <span>{invoice.bills?.total?.toFixed(2) || "0.00"} جنيه</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-xl py-3 text-gray-800 font-medium"
              >
                <FaPrint /> طباعة الفاتورة
              </button>

              <button
                onClick={handleAddToPayment}
                disabled={addToPaymentMutation.isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-medium"
              >
                <FaMoneyBillWave />
                {addToPaymentMutation.isLoading ? "جاري الإضافة..." : "إضافة للدفعات"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">لا توجد بيانات للفاتورة حاليًا</p>
            <button
              onClick={onClose}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
            >
              إغلاق
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceModal;