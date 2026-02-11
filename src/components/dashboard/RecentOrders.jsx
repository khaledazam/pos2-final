import React, { useState, useMemo } from "react";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders, deleteOrder } from "../../https/index";

const RecentOrders = () => {
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const queryClient = useQueryClient();

  // Fetch orders using React Query
  const { data: resData, isError, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  // Show error notification if fetch fails
  React.useEffect(() => {
    if (isError) {
      enqueueSnackbar("Something went wrong while loading orders!", { 
        variant: "error" 
      });
    }
  }, [isError]);

  // ✅ Delete Order & Free Table Mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const res = await deleteOrder(orderId);
      return res;
    },
    onSuccess: () => {
      enqueueSnackbar("Order deleted! Table is now available.", { 
        variant: "success" 
      });
      
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["tables"]);
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.message || "Failed to delete order";
      enqueueSnackbar(errorMsg, { variant: "error" });
    },
    onSettled: () => {
      setProcessingId(null);
    }
  });

  // ✅ Handle Delete Order
  const handleDeleteOrder = (order) => {
    setProcessingId(order._id);
    deleteOrderMutation.mutate(order._id);
  };

  // ✅ Toggle Order Expansion
  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // ✅ Extract orders array correctly
  const ordersArray = useMemo(() => {
    if (!resData) {
      console.log('📦 No response data');
      return [];
    }

    let orders = [];

    if (resData.data?.data) {
      orders = resData.data.data;
    } else if (resData.data) {
      orders = resData.data;
    } else if (Array.isArray(resData)) {
      orders = resData;
    }

    if (!Array.isArray(orders)) {
      return [];
    }

    return orders;
  }, [resData]);

  // Filter orders based on search
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(ordersArray)) {
      return [];
    }

    if (!search.trim()) {
      return ordersArray;
    }

    return ordersArray.filter(order => {
      const customerName = order?.customerDetails?.name?.toLowerCase() || '';
      const searchTerm = search.toLowerCase();
      const orderId = order?._id?.toLowerCase() || '';
      const orderCode = orderId.slice(-6);
      
      return customerName.includes(searchTerm) || 
             orderId.includes(searchTerm) ||
             orderCode.includes(searchTerm);
    });
  }, [ordersArray, search]);

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      "Pending": "bg-yellow-500/20 text-yellow-400",
      "In Progress": "bg-blue-500/20 text-blue-400",
      "Ready": "bg-green-500/20 text-green-400",
      "Completed": "bg-purple-500/20 text-purple-400",
      "Cancelled": "bg-red-500/20 text-red-400"
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };
  return (
    <div className="px-8 mt-6">
      <div className="bg-[#1a1a1a] w-full rounded-lg">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
            Recent Orders
          </h1>
          <a href="#" className="text-[#025cca] text-sm font-semibold">
            View all
          </a>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-6 py-4 mx-6">
          <FaSearch className="text-[#f5f5f5]" />
          <input
            type="text"
            placeholder="Search by customer name or order ID"
            className="bg-[#1f1f1f] outline-none text-[#f5f5f5] w-full"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Order list */}
        <div className="mt-4 px-6 overflow-y-scroll max-h-[500px] scrollbar-hide pb-6">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 text-sm">Loading orders...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
              <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 font-medium">Failed to load orders</p>
              <p className="text-gray-500 text-sm">Please try refreshing the page</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map(order => {
              if (!order || !order._id) {
                return null;
              }

              const isProcessing = processingId === order._id;
              const hasTable = order.table !== null && order.table !== undefined;
              const isExpanded = expandedOrder === order._id;

              return (
                <div 
                  key={order._id} 
                  className="bg-[#1f1f1f] rounded-xl mb-3 overflow-hidden transition-all duration-200"
                >
                  {/* Main Order Info */}
                  <div className="p-4 hover:bg-[#252525] transition-colors duration-200">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left side - Customer & Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {/* Order ID */}
                          <span className="text-[#025cca] font-bold text-sm">
                            #{order._id?.slice(-6)?.toUpperCase() || 'N/A'}
                          </span>
                          
                          {/* Status Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus || 'Unknown'}
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

                        {/* Customer Name */}
                        <h3 className="text-[#f5f5f5] font-semibold mb-1">
                          {order.customerDetails?.name || "Guest"}
                        </h3>

                        {/* Order Details */}
                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                          {/* Items count */}
                          <span>
                            {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                          </span>
                          
                          {/* Table info */}
                          {hasTable && (
                            <span>
                              • Table {order.table.tableNo || order.table.name}
                            </span>
                          )}

                          {/* Order date */}
                          {order.orderDate && (
                            <span>
                              • {new Date(order.orderDate).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                          <p className="text-[#f5f5f5] font-bold text-xl">
                            ${(order.bills?.totalWithTax || order.bills?.total || 0).toFixed(2)}
                          </p>
                          {order.bills?.tax > 0 && (
                            <p className="text-gray-500 text-xs">
                              (incl. ${order.bills.tax.toFixed(2)} tax)
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right side - Action Button */}
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => handleDeleteOrder(order)}
                          disabled={isProcessing || deleteOrderMutation.isPending}
                          className={`
                            px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider
                            transition-all duration-200 flex items-center gap-2
                            ${isProcessing 
                              ? 'bg-gray-600 cursor-wait' 
                              : 'bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95'
                            }
                            text-white shadow-lg
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          {isProcessing ? (
                            <>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle 
                                  className="opacity-25" 
                                  cx="12" 
                                  cy="12" 
                                  r="10" 
                                  stroke="currentColor" 
                                  strokeWidth="4" 
                                  fill="none"
                                />
                                <path 
                                  className="opacity-75" 
                                  fill="currentColor" 
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Deleting...
                            </>
                          ) : (
                            <>
                              🗑️ Delete
                            </>
                          )}
                        </button>
                        
                        {/* Helper text */}
                        <p className="text-xs text-gray-500 text-right max-w-[150px]">
                          Click arrow to view items
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Expandable Items List */}
                  {isExpanded && (
                    <div className="border-t border-[#333] bg-[#1a1a1a] p-4 animate-slideDown">
                      <h4 className="text-[#f5f5f5] font-semibold mb-3 flex items-center gap-2">
                        <span>📋</span>
                        Order Items
                      </h4>
                      
                      {/* Items Table */}
                      <div className="space-y-2">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => (
                            <div 
                              key={index} 
                              className="flex justify-between items-center bg-[#1f1f1f] p-3 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="text-[#f5f5f5] font-medium">
{item?.item?.name || item?.name || item?.product?.name || item?.title || 'منتج غير معروف'}                                </p>
                                <p className="text-gray-400 text-xs">
                                  ${item.unitPrice?.toFixed(2)} × {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[#f5f5f5] font-bold">
                                  ${(item.unitPrice * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">No items in this order</p>
                        )}
                      </div>

                      {/* Order Summary */}
                      <div className="mt-4 pt-4 border-t border-[#333] space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Subtotal:</span>
                          <span className="text-[#f5f5f5]">
                            ${(order.bills?.total || 0).toFixed(2)}
                          </span>
                        </div>
                        {order.bills?.tax > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Tax:</span>
                            <span className="text-[#f5f5f5]">
                              ${order.bills.tax.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#333]">
                          <span className="text-[#f5f5f5]">Total:</span>
                          <span className="text-green-400">
                            ${(order.bills?.totalWithTax || order.bills?.total || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="mt-4 pt-4 border-t border-[#333]">
                        <h5 className="text-gray-400 text-sm font-semibold mb-2">Customer Details</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Name:</span>
                            <span className="text-[#f5f5f5] ml-2">
                              {order.customerDetails?.name || 'Guest'}
                            </span>
                          </div>
                          {order.customerDetails?.phone && (
                            <div>
                              <span className="text-gray-500">Phone:</span>
                              <span className="text-[#f5f5f5] ml-2">
                                {order.customerDetails.phone}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">Guests:</span>
                            <span className="text-[#f5f5f5] ml-2">
                              {order.customerDetails?.guests || 1}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Payment:</span>
                            <span className="text-[#f5f5f5] ml-2">
                              {order.paymentMethod || 'Cash'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : search ? (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
              <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-400 font-medium">No orders found</p>
              <p className="text-gray-600 text-sm">No results for "{search}"</p>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
              <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-400 font-medium">No orders yet</p>
              <p className="text-gray-600 text-sm">Orders will appear here once created</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;