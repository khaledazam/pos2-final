import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";

import { getTotalPrice, removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import { addOrder, updateTable } from "../../https";

import Invoice from "../invoice/Invoice";
import { formatCurrency } from "../../utils";

const Bill = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const customer = useSelector((state) => state.customer);
  const cart = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [autoPrint, setAutoPrint] = useState(false); // ✅ Auto Print State

  /* ================== CREATE ORDER MUTATION ================== */
  const orderMutation = useMutation({
    mutationFn: (payload) => addOrder(payload),
    onSuccess: (res) => {
      console.log("Full response from addOrder:", res); // ← log مهم جدًا عشان نشوف الداتا الحقيقية

      const order = res?.data?.data?.order;
      if (!order || !order._id) {
        console.error("Invalid or missing order data:", order);
        enqueueSnackbar("فشل في الحصول على بيانات الطلب", { variant: "error" });
        return;
      }

      setOrderInfo(order);

      if (order.table?._id) {
        tableMutation.mutate({
          id: order.table._id,
          status: "Booked",
          orderId: order._id,
        });
      }

      enqueueSnackbar("تم تسجيل الطلب بنجاح!", { variant: "success" });
      setShowInvoice(true);
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || "فشل في تسجيل الطلب!";
      enqueueSnackbar(msg, { variant: "error" });
    },
  });

  /* ================== UPDATE TABLE MUTATION ================== */
  const tableMutation = useMutation({
    mutationFn: (payload) => updateTable(payload),
    onSuccess: () => {
      dispatch(removeAllItems());
      dispatch(removeCustomer());
      enqueueSnackbar("تم تحديث حالة الطاولة", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("فشل تحديث حالة الطاولة", { variant: "warning" });
    },
  });

  /* ================== PLACE ORDER HANDLER ================== */
  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      enqueueSnackbar("السلة فارغة!", { variant: "warning" });
      return;
    }

    const tableId = customer?.table?._id;
    const sessionId = customer?.session?._id;

    if (!tableId && !sessionId) {
      enqueueSnackbar("يرجى اختيار طاولة أو جلسة أولاً!", { variant: "warning" });
      return;
    }

    const payload = {
      tableId,
      sessionId,
      items: cart.map((item) => ({
        item: item._id || item.id,
        quantity: item.quantity,
        unitPrice: item.pricePerQuantity || item.price,
      })),
      customerDetails: {
        name: customer.customerName || "ضيف",
        phone: customer.customerPhone || "غير محدد",
        guests: Number(customer.guests) || 1,
      },
      paymentMethod,
    };

    orderMutation.mutate(payload);
  };

  const grandTotal = total; // No tax
  const taxAmount = 0;

  return (
    <>
      {/* Summary */}
      <div className="px-5 mt-4 space-y-3">
        <div className="flex justify-between text-sm text-gray-400">
          <span>عدد العناصر ({cart.length})</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-400">
          <span>الضريبة (0%)</span>
          <span>{formatCurrency(taxAmount)}</span>
        </div>

        <div className="flex justify-between text-lg font-bold text-white border-t border-[#444] pt-3">
          <span>الإجمالي</span>
          <span className="text-yellow-400">{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="flex gap-3 px-5 mt-6">
        {["Cash", "Online"].map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => setPaymentMethod(method)}
            className={`flex-1 py-3.5 rounded-lg font-medium transition-colors ${paymentMethod === method
              ? "bg-[#444] text-white"
              : "bg-[#222] text-gray-400 hover:bg-[#333]"
              }`}
          >
            {method === "Cash" ? "كاش" : "أونلاين"}
          </button>
        ))}
      </div>

      {/* ✅ Auto Print Checkbox */}
      <div className="px-5 mt-4 flex items-center gap-2">
        <input
          type="checkbox"
          id="autoPrint"
          checked={autoPrint}
          onChange={(e) => setAutoPrint(e.target.checked)}
          className="w-5 h-5 accent-yellow-500 cursor-pointer"
        />
        <label htmlFor="autoPrint" className="text-gray-300 cursor-pointer select-none text-sm">
          طباعة تلقائية للفاتورة (Thermal)
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 px-5 mt-4">
        <button
          disabled
          title="Print is handled in Invoice"
          className="flex-1 bg-blue-700/50 py-3.5 rounded-lg text-white font-medium cursor-not-allowed opacity-60 hidden" // Hidden or removed as requested? User said "Add print button to Invoice modal", logic moved there.
        >
          طباعة
        </button>

        <button
          onClick={handlePlaceOrder}
          disabled={orderMutation.isPending}
          className={`flex-1 py-3.5 rounded-lg font-bold transition-colors ${orderMutation.isPending
            ? "bg-yellow-600/50 cursor-wait"
            : "bg-yellow-500 hover:bg-yellow-400 text-black"
            }`}
        >
          {orderMutation.isPending ? "جاري التسجيل..." : "تأكيد الطلب"}
        </button>
      </div>

      {/* Invoice Modal */}
      {showInvoice && orderInfo && (
        <Invoice
          orderInfo={orderInfo}
          setShowInvoice={setShowInvoice}
          autoprint={autoPrint} // ✅ Pass autoPrint prop
        />
      )}
    </>
  );
};

export default Bill;