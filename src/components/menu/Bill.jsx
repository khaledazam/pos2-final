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
  const [autoPrint, setAutoPrint] = useState(false);

  // ────────────────────────────────────────────────
  // Create Order Mutation
  // ────────────────────────────────────────────────
  const orderMutation = useMutation({
    mutationFn: (payload) => addOrder(payload),

    onSuccess: (res) => {
      const order = res?.data?.data?.order;

      if (!order || !order._id) {
        console.error("Invalid order data received:", res);
        enqueueSnackbar("فشل في استلام بيانات الطلب بشكل صحيح", { variant: "error" });
        return;
      }

      setOrderInfo(order);

      // نفرغ السلة والعميل فور نجاح إنشاء الطلب (مهم جدًا)
      dispatch(removeAllItems());
      dispatch(removeCustomer());

      // إذا كان هناك طاولة → نحدث حالتها
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
      const msg =
        error?.response?.data?.message ||
        "حدث خطأ أثناء تسجيل الطلب، حاول مرة أخرى";
      enqueueSnackbar(msg, { variant: "error" });
    },
  });

  // ────────────────────────────────────────────────
  // Update Table Mutation
  // ────────────────────────────────────────────────
  const tableMutation = useMutation({
    mutationFn: (payload) => updateTable(payload),

    onSuccess: () => {
      enqueueSnackbar("تم تحديث حالة الطاولة بنجاح", { variant: "success" });
    },

    onError: () => {
      enqueueSnackbar("فشل تحديث حالة الطاولة", { variant: "warning" });
      // ملحوظة: السلة والعميل تم تفريغهما بالفعل في orderMutation
    },
  });

  // ────────────────────────────────────────────────
  // Place Order Handler
  // ────────────────────────────────────────────────
  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      enqueueSnackbar("السلة فارغة! أضف منتجات أولاً", { variant: "warning" });
      return;
    }

    const tableId = customer?.table?._id;
    const sessionId = customer?.session?._id;

    if (!tableId && !sessionId) {
      enqueueSnackbar("يرجى اختيار طاولة أو جلسة أولاً", { variant: "warning" });
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

  const grandTotal = total;
  const taxAmount = 0;

  return (
    <>
      {/* ملخص الفاتورة */}
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

      {/* طرق الدفع */}
      <div className="flex gap-3 px-5 mt-6">
        {["Cash", "Online"].map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => setPaymentMethod(method)}
            className={`flex-1 py-3.5 rounded-lg font-medium transition-colors ${
              paymentMethod === method
                ? "bg-[#444] text-white"
                : "bg-[#222] text-gray-400 hover:bg-[#333]"
            }`}
          >
            {method === "Cash" ? "كاش" : "أونلاين"}
          </button>
        ))}
      </div>

      {/* خيار الطباعة التلقائية */}
      <div className="px-5 mt-4 flex items-center gap-2">
        <input
          type="checkbox"
          id="autoPrint"
          checked={autoPrint}
          onChange={(e) => setAutoPrint(e.target.checked)}
          className="w-5 h-5 accent-yellow-500 cursor-pointer"
        />
        <label
          htmlFor="autoPrint"
          className="text-gray-300 cursor-pointer select-none text-sm"
        >
          طباعة تلقائية للفاتورة (Thermal Printer)
        </label>
      </div>

      {/* الأزرار */}
      <div className="flex gap-3 px-5 mt-6 pb-6">
        <button
          onClick={handlePlaceOrder}
          disabled={orderMutation.isPending || cart.length === 0}
          className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
            orderMutation.isPending || cart.length === 0
              ? "bg-yellow-600/50 cursor-not-allowed text-gray-300"
              : "bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20"
          }`}
        >
          {orderMutation.isPending ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
              جاري التسجيل...
            </div>
          ) : (
            "تأكيد الطلب وإصدار الفاتورة"
          )}
        </button>
      </div>

      {/* نافذة الفاتورة */}
      {showInvoice && orderInfo && (
        <Invoice
          orderInfo={orderInfo}
          setShowInvoice={setShowInvoice}
          autoPrint={autoPrint}
        />
      )}
    </>
  );
};

export default Bill;