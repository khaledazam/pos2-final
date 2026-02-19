import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { MdRestaurantMenu } from "react-icons/md";
import MenuContainer from "../components/menu/MenuContainer";
import CustomerInfo from "../components/menu/CustomerInfo";
import CartInfo from "../components/menu/CartInfo";
import Bill from "../components/menu/Bill";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { getInventory } from "../https";

const Menu = () => {
  useEffect(() => {
    document.title = "POS | Menu";
  }, []);

  const customerData = useSelector((state) => state.customer);
  const user = useSelector((state) => state.user);
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const { data: inventoryData, isLoading, error } = useQuery({
    queryKey: ["inventory"],
    queryFn: getInventory,
    select: (res) => res?.data?.data || [],
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="flex flex-col h-screen bg-[#1f1f1f] overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4 border-b border-gray-800">
        <div className="flex items-center gap-3 md:gap-4">
          <BackButton />
          <h1 className="text-white text-xl md:text-2xl font-bold tracking-wide">Menu</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <MdRestaurantMenu className="text-[#e2bc15] text-3xl" />
            <div className="flex flex-col">
              <span className="text-white font-medium">
                {customerData.customerName || "اسم العميل"}
              </span>
              <span className="text-gray-400 text-xs">
                طاولة: {customerData.table?.tableNo || "غير محددة"}
              </span>
            </div>
          </div>

          {/* زر عائم أو أيقونة السلة على الموبايل */}
          <button className="md:hidden bg-yellow-600 text-white p-3 rounded-full shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Menu area – ياخد كل العرض على الموبايل */}
        <main className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-t-4 border-[#e2bc15] mx-auto mb-4"></div>
                <p className="text-[#e2bc15] font-bold text-lg md:text-xl">جاري تحميل المنيو...</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-red-500 text-lg md:text-xl p-4 text-center">
              فشل تحميل المنيو: {error.message || "خطأ غير معروف"}
            </div>
          ) : inventoryData?.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-lg md:text-xl">
              لا توجد منتجات متاحة حاليًا
            </div>
          ) : (
            <MenuContainer inventoryItems={inventoryData} />
          )}
        </main>

        {/* Sidebar – مخفي على الموبايل، يظهر على الشاشات الكبيرة */}
        <aside className="hidden lg:block w-80 xl:w-96 bg-[#1a1a1a] border-l border-gray-800 overflow-y-auto">
          <div className="p-4 space-y-6">
            <CustomerInfo />
            <hr className="border-gray-800" />
            <CartInfo />
            <hr className="border-gray-800" />
            <Bill />
          </div>
        </aside>
      </div>

      {/* Bottom navigation for non-admin users on mobile */}
      {!isAdmin && <BottomNav />}

      {/* Bottom sheet / Drawer for cart on mobile – يمكن تنفيذه لاحقًا */}
      {/* مثال بسيط: */}
      {/* {showCartSheet && (
        <div className="fixed inset-0 bg-black/60 z-50 lg:hidden" onClick={() => setShowCartSheet(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-3xl max-h-[85vh] overflow-y-auto">
            {/* محتوى الـ Cart + Bill هنا */}
          {/* </div>
        </div>
      )} */}
    </div>
  );
};

export default Menu;