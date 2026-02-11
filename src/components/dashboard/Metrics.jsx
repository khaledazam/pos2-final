import { getOrders, getInventory, getTables, getSummary } from "../../https";
import React from "react";
import { useQuery } from "@tanstack/react-query";


const Metrics = () => {

  const { data: summaryData } = useQuery({
    queryKey: ["summary"],
    queryFn: getSummary
  });

  const { data: ordersData } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders
  });

  const { data: inventoryData } = useQuery({
    queryKey: ["inventory"],
    queryFn: getInventory
  });

  const { data: tablesData } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables
  });

  // Calculations from Summary and fallback queries
  const summary = summaryData?.data?.data || {};
  const orders = ordersData?.data?.data || [];
  const inventory = inventoryData?.data?.data || [];
  const tables = tablesData?.data?.data || [];

  const totalRevenue = summary.todaySales || orders.reduce((acc, order) => acc + (order.bills?.totalWithTax || 0), 0);
  const activeOrders = orders.filter(o => o.orderStatus === "In Progress").length;
  const totalCustomers = orders.reduce((acc, order) => acc + (order.customerDetails?.guests || 1), 0);

  const totalItems = inventory.length;
  const totalCategories = new Set(inventory.map(i => i.category)).size;
  const lowStockItems = summary.lowStockProducts || inventory.filter(item => item.quantity <= item.threshold).length;

  const metrics = [
    { title: "Total Revenue", value: `${totalRevenue.toFixed(2)} EGP`, percentage: "---", color: "#025cca", isIncrease: true },
    { title: "Active Orders", value: activeOrders, percentage: "---", color: "#02ca3a", isIncrease: true },
    { title: "Total Customers", value: totalCustomers, percentage: "---", color: "#f6b100", isIncrease: true },
    { title: "Total Tables", value: tables.length, percentage: "---", color: "#be3e3f", isIncrease: false },
  ];

  const itemsMetrics = [
    { title: "Total Categories", value: totalCategories, color: "#5b45b0" },
    { title: "Total Items", value: totalItems, color: "#285430" },
    { title: "Completed Orders", value: orders.filter(o => o.orderStatus === "Ready").length, color: "#735f32" },
    { title: "Low Stock Items", value: lowStockItems, color: "#be3e3f" },
    { title: "Booked Tables", value: tables.filter(t => t.status === "Booked").length, color: "#7f167f" }
  ];

  return (
    <div className="container mx-auto py-4 px-6 md:px-4 text-left">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-black text-[#f5f5f5] text-3xl mb-2">
            Store Performance Overveiw
          </h2>
          <p className="text-lg text-[#ababab] font-bold">
            Vital metrics and growth summary.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          return (
            <div
              key={index}
              className="shadow-2xl rounded-[2rem] p-8 border-r-8"
              style={{ backgroundColor: "#1f1f1f", borderRightColor: metric.color }}
            >
              <div className="flex justify-between items-center mb-4">
                <p className="font-black text-lg text-[#ababab]">
                  {metric.title}
                </p>
                <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full">
                  <p
                    className="font-black text-sm text-gray-400"
                  >
                    Live
                  </p>
                </div>
              </div>
              <p className="mt-2 font-black text-4xl text-[#f5f5f5] tabular-nums">
                {metric.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col justify-between mt-16">
        <div className="border-l-8 border-[#e2bc15] pl-6">
          <h2 className="font-black text-3xl text-[#f5f5f5] mb-2">
            Item Details
          </h2>
          <p className="text-lg text-[#ababab] font-bold">
            Quick inventory, categories, and active orders.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {
            itemsMetrics.map((item, index) => {
              return (
                <div key={index} className="shadow-2xl rounded-[2rem] p-8 bg-[#1f1f1f] border border-[#333] hover:border-[#e2bc15]/30 transition-all group">
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-black text-lg text-[#ababab] group-hover:text-white transition-colors">{item.title}</p>
                  </div>
                  <p className="mt-2 font-black text-4xl text-[#e2bc15] tabular-nums group-hover:scale-110 transition-transform origin-right inline-block">{item.value}</p>
                </div>
              )
            })
          }

        </div>
      </div>
    </div>
  );
};

export default Metrics;
