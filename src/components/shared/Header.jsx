import React from "react";
import { FaSearch } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import logo from "../../assets/images/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { IoLogOut } from "react-icons/io5";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { FaGamepad } from "react-icons/fa";
import { MdDashboard, MdInventory, MdTableBar, MdMenuBook } from "react-icons/md";

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: (data) => {
      console.log(data);
      performCleanup();
    },
    onError: (error) => {
      console.log("Logout error:", error);
      // Force cleanup even if server fails
      performCleanup();
    },
  });

  const queryClient = useQueryClient();

  const performCleanup = () => {
    // ✅ ADDED: Clear all auth data locally
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    queryClient.clear();
    dispatch(removeUser());
    navigate("/auth", { replace: true });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="flex justify-between items-center py-6 px-10 bg-[#1a1a1a] border-b border-[#333]">
      {/* LOGO */}
      <div onClick={() => navigate("/")} className="flex items-center gap-4 cursor-pointer group">
        <div className="bg-[#e2bc15] p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
          <img src={logo} className="h-10 w-10 brightness-0" alt="logo" />
        </div>
        <h1 className="text-2xl font-black text-[#f5f5f5] tracking-tight">
          Cafe POS <span className="text-[#e2bc15]">System</span>
        </h1>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-2xl px-6 py-3 w-[600px] border border-[#333] focus-within:border-[#e2bc15] transition-all">
        <FaSearch className="text-[#ababab]" />
        <input
          type="text"
          placeholder="Search for orders, items, or devices..."
          className="bg-transparent outline-none text-[#f5f5f5] w-full text-lg font-bold placeholder:text-[#444]"
        />
      </div>

      {/* LOGGED USER DETAILS */}
      <div className="flex items-center gap-8">
        <div className="bg-[#1f1f1f] rounded-2xl p-4 cursor-pointer text-[#f5f5f5] hover:bg-[#333] transition-all relative">
          <FaBell className="text-2xl" />
          <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1a1a1a]"></span>
        </div>

        <div className="flex items-center gap-4 group">
          <div className="flex flex-col items-start">
            <h1 className="text-lg text-[#f5f5f5] font-black tracking-wide">
              {userData.user?.name || "Demo User"}
            </h1>
            <p className="text-sm text-[#e2bc15] font-black bg-[#e2bc15]/10 px-2 py-0.5 rounded-lg">
              {userData.user?.role?.toLowerCase() === "admin" ? "Administrator" : "Cashier"}
            </p>
          </div>
          <div className="relative">
            <FaUserCircle className="text-[#f5f5f5] text-5xl group-hover:text-[#e2bc15] transition-colors" />
            <div
              onClick={handleLogout}
              className="absolute -bottom-1 -left-1 bg-red-600 p-2 rounded-lg cursor-pointer hover:bg-red-700 transition-colors shadow-lg"
              title="Logout"
            >
              <IoLogOut className="text-white" size={20} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
