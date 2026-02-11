import React from "react";

const OrderList = ({ order }) => {
  // ✅ Safety checks
  if (!order || !order._id) {
    return null;
  }

  // ✅ Extract data safely
  const orderId = order._id?.slice(-6)?.toUpperCase() || "N/A";
  const customerName = order.customerDetails?.name || "Guest";
  const itemCount = order.items?.length || 0;
  const orderStatus = order.orderStatus || "Unknown";
  const total = order.bills?.totalWithTax || order.bills?.total || 0;
  
  // ✅ Table info (can be null for takeaway orders)
  const tableInfo = order.table 
    ? `Table ${order.table.tableNo || order.table.name || "N/A"}`
    : "Takeaway";

  // ✅ Time formatting
  const orderTime = order.orderDate 
    ? new Date(order.orderDate).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : "N/A";

  // ✅ Status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "In Progress":
        return "bg-blue-500/20 text-blue-400";
      case "Ready":
        return "bg-green-500/20 text-green-400";
      case "Completed":
        return "bg-gray-500/20 text-gray-400";
      case "Paid":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="bg-[#262626] p-4 rounded-xl border border-[#333] hover:border-[#e2bc15] transition-all">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-[#e2bc15] font-bold text-lg">#{orderId}</h3>
          <p className="text-[#ababab] text-sm">{customerName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(orderStatus)}`}>
          {orderStatus}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm text-[#ababab] mb-3">
        <div className="flex justify-between">
          <span>Items:</span>
          <span className="text-[#f5f5f5] font-semibold">{itemCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Table:</span>
          <span className="text-[#f5f5f5] font-semibold">{tableInfo}</span>
        </div>
        <div className="flex justify-between">
          <span>Time:</span>
          <span className="text-[#f5f5f5] font-semibold">{orderTime}</span>
        </div>
      </div>

      {/* Total */}
      <div className="pt-3 border-t border-[#333] flex justify-between items-center">
        <span className="text-[#ababab] text-sm">Total:</span>
        <span className="text-[#e2bc15] font-black text-xl">${total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default OrderList;