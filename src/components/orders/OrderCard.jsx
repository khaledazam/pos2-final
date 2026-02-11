import React, { useState } from "react";
import { FaCheckDouble, FaLongArrowAltRight, FaCircle } from "react-icons/fa";
import { formatDateAndTime, getAvatarName, formatCurrency } from "../../utils";
import axios from "axios";
import { useSnackbar } from "notistack";

const OrderCard = ({ order, refetchOrders }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);

  // دالة تحديث الحالة
  const completeOrder = async () => {
    setLoadingComplete(true);
    try {
      await axios.put(`/api/orders/${order._id}`, {
        orderStatus: "Completed"
      });
      enqueueSnackbar("Order completed successfully!", { variant: "success" });
      refetchOrders();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Failed to complete order!", { variant: "error" });
    } finally {
      setLoadingComplete(false);
    }
  };

  // دالة Add to Payment
  const handleAddToPayment = async () => {
    setLoadingPayment(true);
    try {
      const res = await axios.post("/api/orders/addToPayment", { orderId: order._id });
      enqueueSnackbar("Order added to payment successfully!", { variant: "success" });
      refetchOrders(); // تحديث الواجهة بعد الدفع
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.response?.data?.message || "Failed to add to payment", { variant: "error" });
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <div className="w-[500px] bg-[#262626] p-4 rounded-lg mb-4">
      <div className="flex items-center gap-5">
        <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
          {getAvatarName(order.customerDetails.name)}
        </button>
        <div className="flex items-center justify-between w-[100%]">
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
              {order.customerDetails.name}
            </h1>
            <p className="text-[#ababab] text-sm">#{Math.floor(new Date(order.orderDate).getTime())} / Dine in</p>
            <p className="text-[#ababab] text-sm">
              Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" /> {order.table.tableNo}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {order.orderStatus === "Ready" ? (
              <>
                <p className="text-green-600 bg-[#2e4a40] px-2 py-1 rounded-lg">
                  <FaCheckDouble className="inline mr-2" /> {order.orderStatus}
                </p>
                <p className="text-[#ababab] text-sm">
                  <FaCircle className="inline mr-2 text-green-600" /> Ready to serve
                </p>
              </>
            ) : (
              <>
                <p className="text-yellow-600 bg-[#4a452e] px-2 py-1 rounded-lg">
                  <FaCircle className="inline mr-2" /> {order.orderStatus}
                </p>
                <p className="text-[#ababab] text-sm">
                  <FaCircle className="inline mr-2 text-yellow-600" /> Preparing your order
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 text-[#ababab]">
        <p>{formatDateAndTime(order.orderDate)}</p>
        <p>{order.items.length} Items</p>
      </div>
      <hr className="w-full mt-4 border-t-1 border-gray-500" />
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[#f5f5f5] text-lg font-semibold">Total</h1>
        <p className="text-[#f5f5f5] text-lg font-semibold">{formatCurrency(order.bills.totalWithTax)}</p>
      </div>

      {/* زر Complete */}
      {order.orderStatus !== "Completed" && (
        <button
          onClick={completeOrder}
          disabled={loadingComplete}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          {loadingComplete ? "Processing..." : "Complete Order"}
        </button>
      )}

      {/* زر Add to Payment */}
      {order.orderStatus === "Completed" && (
        <button
          onClick={handleAddToPayment}
          disabled={loadingPayment}
          className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loadingPayment ? "Processing..." : "Add to Payment"}
        </button>
      )}
    </div>
  );
};

export default OrderCard;
