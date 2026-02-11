import React, { useRef } from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa6";
import { formatCurrency } from "../../utils/index";
import ThermalPrinter from "../shared/ThermalPrinter"; // ✅ Import

const Invoice = ({ orderInfo, setShowInvoice, autoprint }) => { // ✅ Add autoprint prop
  const invoiceRef = useRef(null);

  const handlePrint = () => {
    if (!invoiceRef.current) return;
    const printContent = invoiceRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");

    WinPrint.document.write(`
      <html>
        <head>
          <title>Order Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt-container { width: 300px; border: 1px solid #ddd; padding: 10px; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 500);
  };

  // حماية ضد orderInfo undefined أو null
  if (!orderInfo) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-[400px] text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">خطأ</h2>
          <p className="text-gray-700 mb-6">لا توجد بيانات للفاتورة حاليًا</p>
          <button
            onClick={() => setShowInvoice(false)}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-[400px] max-h-[90vh] overflow-y-auto">
        {/* Receipt Content */}
        <div ref={invoiceRef} className="p-4">
          {/* Header */}
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
              className="w-12 h-12 border-8 border-green-500 rounded-full flex items-center justify-center shadow-lg bg-green-500"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-2xl text-white"
              >
                <FaCheck />
              </motion.span>
            </motion.div>
          </div>

          <h2 className="text-xl font-bold text-center mb-2">Order Receipt</h2>
          <p className="text-gray-600 text-center">Thank you for your order!</p>

          {/* Customer Details */}
          <div className="mt-4 border-t pt-4 text-sm text-gray-700">
            <p>
              <strong>Order ID:</strong>{" "}
              {orderInfo._id ? orderInfo._id.slice(-6).toUpperCase() : "غير متوفر"}
            </p>
            {orderInfo.customerDetails && (
              <>
                <p>
                  <strong>Name:</strong> {orderInfo.customerDetails.name || "غير محدد"}
                </p>
                <p>
                  <strong>Phone:</strong> {orderInfo.customerDetails.phone || "-"}
                </p>
                <p>
                  <strong>Guests:</strong> {orderInfo.customerDetails.guests || "-"}
                </p>
              </>
            )}
          </div>

          {/* Items */}
          {orderInfo.items?.length > 0 ? (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-semibold">Items Ordered</h3>
              <ul className="text-sm text-gray-700">
                {orderInfo.items.map((item, index) => (
                  <li key={index} className="flex justify-between items-center text-xs">
                    <span>
                      {item.name || "منتج غير معروف"} x{item.quantity || 0}
                    </span>
                    <span>{formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-gray-500 text-center">لا توجد عناصر في الطلب</p>
          )}

          {/* Bills */}
          {orderInfo.bills && (
            <div className="mt-4 border-t pt-4 text-sm">
              <p>
                <strong>Subtotal:</strong> {formatCurrency(orderInfo.bills.total || 0)}
              </p>
              {orderInfo.bills.tax !== undefined && (
                <p>
                  <strong>Tax:</strong> {formatCurrency(orderInfo.bills.tax || 0)}
                </p>
              )}
              <p className="text-md font-semibold">
                <strong>Grand Total:</strong>{" "}
                {formatCurrency(orderInfo.bills.totalWithTax || orderInfo.bills.total || 0)}
              </p>
            </div>
          )}

          {/* Payment Info */}
          <div className="mb-2 mt-2 text-xs">
            <p>
              <strong>Payment Method:</strong> {orderInfo.paymentMethod || "-"}
            </p>
            {orderInfo.paymentData && (
              <>
                {orderInfo.paymentData.razorpay_order_id && (
                  <p>
                    <strong>Razorpay Order ID:</strong>{" "}
                    {orderInfo.paymentData.razorpay_order_id}
                  </p>
                )}
                {orderInfo.paymentData.razorpay_payment_id && (
                  <p>
                    <strong>Razorpay Payment ID:</strong>{" "}
                    {orderInfo.paymentData.razorpay_payment_id}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-4 items-center">
          {/* ✅ Thermal Printer Button */}
          <ThermalPrinter invoice={orderInfo} autoprint={autoprint} />

          <button
            onClick={() => setShowInvoice(false)}
            className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-bold border border-red-200"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;