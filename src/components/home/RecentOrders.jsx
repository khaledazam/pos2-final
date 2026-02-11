import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, deleteOrder } from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { FaChevronDown, FaChevronUp, FaTrash } from "react-icons/fa";

const RecentOrders = () => {
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState(null);

  // ✅ Fetch Orders
  const { data: resData, isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    onError: (err) => {
      console.error("Error fetching orders:", err);
      enqueueSnackbar("Failed to load orders", { variant: "error" });
    }
  });

  // ✅ Delete Order Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      enqueueSnackbar("Order deleted! Table is now available.", { variant: "success" });
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["tables"]);
    },
    onError: (err) => {
      enqueueSnackbar(err.response?.data?.message || "Failed to delete order", { variant: "error" });
    }
  });

  // ✅ Extract orders safely
  const orders = useMemo(() => {
    if (!resData) return [];
    
    let ordersArray = [];
    
    if (resData.data?.data) {
      ordersArray = resData.data.data;
    } else if (resData.data) {
      ordersArray = resData.data;
    } else if (Array.isArray(resData)) {
      ordersArray = resData;
    }
    
    if (!Array.isArray(ordersArray)) {
      return [];
    }
    
    return ordersArray;
  }, [resData]);

  const handleDelete = (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      deleteMutation.mutate(orderId);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-8 text-red-500">
        Failed to load orders
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.length > 0 ? (
        orders.map((order) => {
          // ✅ Safety check
          if (!order || !order._id) return null;

          const isExpanded = expandedOrder === order._id;

          // ✅ Extract data safely
          const orderId = order._id?.slice(-6)?.toUpperCase() || "N/A";
          const customerName = order.customerDetails?.name || "Guest";
          const itemCount = order.items?.length || 0;
          const orderStatus = order.orderStatus || "Unknown";
          const total = order.bills?.totalWithTax || order.bills?.total || 0;
          
          // ✅ Table info (can be null)
          const tableInfo = order.table 
            ? `Table ${order.table.tableNo || order.table.name || "N/A"}`
            : "Takeaway";

          const orderTime = order.orderDate 
            ? new Date(order.orderDate).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            : "N/A";

          return (
            <div
              key={order._id}
              className="bg-[#1a1a1a] rounded-xl overflow-hidden transition-all duration-200"
            >
              {/* Main Order Info */}
              <div className="p-6 hover:bg-[#1f1f1f] transition-colors duration-200">
                <div className="flex items-start justify-between gap-4">
                  {/* Left side */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Order ID */}
                      <h3 className="text-[#025cca] font-bold text-lg">
                        #{orderId}
                      </h3>
                      
                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        orderStatus === "Pending" ? "bg-yellow-500/20 text-yellow-400" :
                        orderStatus === "In Progress" ? "bg-blue-500/20 text-blue-400" :
                        orderStatus === "Ready" ? "bg-green-500/20 text-green-400" :
                        orderStatus === "Paid" ? "bg-green-500/20 text-green-400" :
                        "bg-gray-500/20 text-gray-400"
                      }`}>
                        {orderStatus}
                      </span>

                      {/* Expand Button */}
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

                    {/* Customer & Info */}
                    <div className="flex items-center gap-6 text-sm text-gray-400 mb-2">
                      <span>👤 {customerName}</span>
                      <span>📦 {itemCount} items</span>
                      <span>🪑 {tableInfo}</span>
                      <span>🕐 {orderTime}</span>
                    </div>

                    {/* Total */}
                    <div className="flex items-baseline gap-2">
                      <p className="text-[#f5f5f5] font-bold text-2xl">
                        ${total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Right side - Delete Button */}
                  <button
                    onClick={() => handleDelete(order._id)}
                    disabled={deleteMutation.isPending}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </div>

              {/* Expandable Details */}
              {isExpanded && (
                <div className="border-t border-[#333] bg-[#121212] p-6">
                  <h4 className="text-[#f5f5f5] font-semibold mb-4 flex items-center gap-2">
                    <span>📋</span>
                    Order Items
                  </h4>
                  
                  {/* Items Table */}
                  <div className="space-y-2 mb-6">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center bg-[#1a1a1a] p-4 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-[#f5f5f5] font-medium">
                              {item.name || "Unknown Item"}
                            </p>
                            <p className="text-gray-400 text-sm">
                              ${(item.unitPrice || 0).toFixed(2)} × {item.quantity || 0}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#f5f5f5] font-bold text-lg">
                              ${((item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No items</p>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="border-t border-[#333] pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal:</span>
                      <span className="text-[#f5f5f5] font-medium">
                        ${(order.bills?.total || 0).toFixed(2)}
                      </span>
                    </div>
                    {order.bills?.tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Tax:</span>
                        <span className="text-[#f5f5f5] font-medium">
                          ${order.bills.tax.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold pt-3 border-t border-[#333]">
                      <span className="text-[#f5f5f5]">Total:</span>
                      <span className="text-green-400">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Customer Details */}
                  {order.customerDetails && (
                    <div className="mt-6 pt-6 border-t border-[#333]">
                      <h5 className="text-gray-400 text-sm font-semibold mb-3">Customer Information</h5>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Name:</span>
                          <span className="text-[#f5f5f5] ml-2 font-medium">
                            {order.customerDetails.name || "Guest"}
                          </span>
                        </div>
                        {order.customerDetails.phone && (
                          <div>
                            <span className="text-gray-500">Phone:</span>
                            <span className="text-[#f5f5f5] ml-2 font-medium">
                              {order.customerDetails.phone}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Guests:</span>
                          <span className="text-[#f5f5f5] ml-2 font-medium">
                            {order.customerDetails.guests || 1}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Payment:</span>
                          <span className="text-[#f5f5f5] ml-2 font-medium">
                            {order.paymentMethod || "Cash"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-center py-32 bg-[#1a1a1a] rounded-lg">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400 font-medium mb-2">No orders yet</p>
          <p className="text-gray-600 text-sm">Orders will appear here</p>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;