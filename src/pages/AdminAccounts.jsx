import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getInvoices } from "../https";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { FaFileInvoice, FaFilter, FaClock, FaTable, FaBox, FaMoneyBillWave, FaSpinner, FaExclamationTriangle } from "react-icons/fa";

/**
 * AdminAccounts Component
 * Displays and filters invoices for Admin users.
 * Isolated from existing logic to satisfy SPEC-2026 / Implementation Plan.
 */
const AdminAccounts = () => {
    const [filter, setFilter] = useState("all");
    const { user } = useSelector((state) => state.user);

    // Filter labels and IDs
    const filterOptions = [
        { id: "all", label: "All Invoices" },
        { id: "today", label: "Today" },
        { id: "week", label: "This Week" },
        { id: "month", label: "This Month" }
    ];

    // Fetch invoices with filter
    const { data: res, isLoading, isError, error } = useQuery({
        queryKey: ["invoices", filter],
        queryFn: () => getInvoices(filter),
        retry: 1
    });

    // Admin-only protection
    if (user?.role?.toLowerCase() !== "admin") {
        return <Navigate to="/pos" replace />;
    }

    const invoices = res?.data?.data || [];

    // Date formatting helper
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="bg-[#1a1a1a] min-h-screen text-[#f5f5f5] p-6 lg:p-10 font-sans">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-4 text-white">
                        <FaFileInvoice className="text-[#e2bc15]" />
                        Admin <span className="text-[#e2bc15]">Accounts</span>
                    </h1>
                    <p className="text-[#ababab] mt-2 font-medium text-lg">Manage and review all sales invoices and order history.</p>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap items-center gap-3 bg-[#1f1f1f] p-2 rounded-2xl border border-[#333]">
                    <div className="flex items-center gap-2 px-3 text-[#ababab] font-bold border-r border-[#333] mr-2">
                        <FaFilter size={14} /> <span className="text-xs uppercase tracking-widest">Filter</span>
                    </div>
                    {filterOptions.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setFilter(opt.id)}
                            className={`px-5 py-2 rounded-xl text-sm font-black transition-all duration-300 ${filter === opt.id
                                    ? "bg-[#e2bc15] text-black shadow-lg shadow-yellow-500/20"
                                    : "text-[#ababab] hover:bg-[#262626] hover:text-white"
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-[#1f1f1f] rounded-[2.5rem] border border-[#333] shadow-2xl overflow-hidden animate-in fade-in duration-500">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <FaSpinner className="animate-spin text-5xl text-[#e2bc15]" />
                        <p className="text-[#e2bc15] font-black text-xl animate-pulse">Fetching Invoices...</p>
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-40 text-center px-10">
                        <FaExclamationTriangle className="text-red-500 text-6xl mb-6" />
                        <h2 className="text-3xl font-black text-white mb-2 uppercase">Sync Error</h2>
                        <p className="text-[#ababab] text-lg max-w-md">
                            {error?.response?.data?.message || "Could not retrieve invoices. Please check if the API endpoint '/api/orders/invoices' is configured on your server."}
                        </p>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 text-center">
                        <div className="bg-[#262626] p-10 rounded-full mb-8">
                            <FaFileInvoice className="text-[#444] text-7xl" />
                        </div>
                        <h2 className="text-3xl font-black text-[#555] uppercase italic">No Records Found</h2>
                        <p className="text-[#666] text-lg mt-2">Try changing your filter settings to see more data.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#262626] text-[#ababab] text-left border-b border-[#333]">
                                    <th className="p-6 text-xs uppercase tracking-widest font-black">Invoice Details</th>
                                    <th className="p-6 text-xs uppercase tracking-widest font-black text-center">Table/Area</th>
                                    <th className="p-6 text-xs uppercase tracking-widest font-black text-center">Items Count</th>
                                    <th className="p-6 text-xs uppercase tracking-widest font-black text-right">Revenue</th>
                                    <th className="p-6 text-xs uppercase tracking-widest font-black text-center">Payment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#333]">
                                {invoices.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-[#252525] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[#f5f5f5] font-black text-lg group-hover:text-[#e2bc15] transition-colors">#{inv._id?.slice(-8).toUpperCase()}</span>
                                                <div className="flex items-center gap-2 text-sm text-[#888] font-bold">
                                                    <FaClock className="text-xs" /> {formatDate(inv.createdAt)}
                                                </div>
                                                <span className="text-[10px] text-[#444] font-mono mt-1 uppercase">Order: {inv.orderId || inv._id}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="bg-[#333] p-2 rounded-xl text-[#e2bc15] group-hover:bg-[#e2bc15] group-hover:text-black transition-all mb-2">
                                                    <FaTable size={18} />
                                                </div>
                                                <span className="text-sm font-black text-[#ababab]">{inv.table?.tableNo || inv.sessionId || "Takeaway"}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl font-black text-white">{inv.items?.length || 0}</span>
                                                <span className="text-[10px] text-[#555] font-black uppercase tracking-tighter">Products</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-2xl font-black text-[#e2bc15] flex items-center gap-2">
                                                    <FaMoneyBillWave className="text-sm opacity-50" />
                                                    {(inv.bills?.totalWithTax || inv.totalAmount || 0).toFixed(2)} EGP
                                                </span>
                                                <span className="text-[10px] text-[#444] font-bold uppercase">Incl. 14% VAT</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider ${inv.paymentMethod?.toLowerCase() === 'cash'
                                                    ? 'bg-[#2e4a40] text-[#02ca3a]'
                                                    : 'bg-[#2b3a4a] text-[#025cca]'
                                                }`}>
                                                {inv.paymentMethod || 'Cash'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer / Pagination Placeholder */}
            {invoices.length > 0 && (
                <div className="mt-8 flex justify-between items-center px-6">
                    <p className="text-[#444] text-xs font-black uppercase tracking-widest">Showing {invoices.length} results</p>
                    <div className="flex items-center gap-2">
                        <button disabled className="bg-[#1f1f1f] text-[#444] px-4 py-2 rounded-xl text-xs font-bold border border-[#333]">Prev</button>
                        <button disabled className="bg-[#1f1f1f] text-[#444] px-4 py-2 rounded-xl text-xs font-bold border border-[#333]">Next</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAccounts;
