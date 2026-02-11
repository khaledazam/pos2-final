import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdDashboard, MdInventory, MdTableBar, MdMenuBook } from "react-icons/md";
import { FaGamepad, FaHome } from "react-icons/fa";
import logo from "../../assets/images/logo.png";

import { useSelector } from "react-redux";

const Sidebar = () => {
    const { user } = useSelector(state => state.user);
    const role = user?.role?.toLowerCase();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { label: "Dashboard", icon: <MdDashboard size={24} />, path: "/dashboard", roles: ["admin"] },
        { label: "POS", icon: <FaHome size={24} />, path: "/pos", roles: ["cashier", "admin"] },
        { label: "Inventory", icon: <MdInventory size={24} />, path: "/inventory", roles: ["admin"] },
        { label: "PlayStation", icon: <FaGamepad size={24} />, path: "/playstation", roles: ["cashier", "admin"] },
        { label: "Tables", icon: <MdTableBar size={24} />, path: "/tables", roles: ["cashier","admin"] },
        { label: "Menu", icon: <MdMenuBook size={24} />, path: "/menu", roles: ["cashier","admin"] },
    ].filter(item => item.roles.includes(role));

    return (
        <aside className="w-80 bg-[#1a1a1a] border-r border-[#333] flex flex-col h-screen sticky top-0">
            {/* Logo Section */}
            <div className="p-8 border-b border-[#333] mb-6 flex items-center gap-4">
                <div className="bg-[#e2bc15] p-2 rounded-xl">
                    <img src={logo} className="h-8 w-8 brightness-0" alt="logo" />
                </div>
                <h1 className="text-xl font-black text-[#f5f5f5]">
                    POS <span className="text-[#e2bc15]">System</span>
                </h1>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-lg transition-all duration-200 group ${isActive
                                ? "bg-[#e2bc15] text-black shadow-lg shadow-yellow-500/10"
                                : "text-[#ababab] hover:text-white hover:bg-[#262626]"
                                }`}
                        >
                            <span className={`${isActive ? "text-black" : "text-[#e2bc15] group-hover:scale-110 transition-transform"}`}>
                                {item.icon}
                            </span>
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Footer / Version */}
            <div className="p-8 border-t border-[#333]">
                <div className="bg-[#1f1f1f] rounded-2xl p-4 border border-[#333]">
                    <p className="text-xs text-[#ababab] font-bold">Version v1.0.4</p>
                    <p className="text-[10px] text-[#555] mt-1">Server Connected</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
