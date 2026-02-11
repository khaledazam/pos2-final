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
import { getInventory } from "../https"; // ← تأكد إن الدالة دي موجودة وبتجيب /api/products

const Menu = () => {
  useEffect(() => {
    document.title = "POS | Menu";
  }, []);

  const customerData = useSelector((state) => state.customer);
  const user = useSelector((state) => state.user);
  const isAdmin = user.role?.toLowerCase() === "admin";

  // جلب المنتجات من الـ inventory (بدل أي داتا ثابتة)
  const { data: inventoryData, isLoading, error } = useQuery({
    queryKey: ["inventory"],
    queryFn: getInventory, // ← بتجيب { success: true, data: [...] }
    select: (res) => res.data?.data || [], // ← نأخذ الـ array من response.data.data
    staleTime: 5 * 60 * 1000, // 5 دقايق
  });

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex gap-3">
      {/* Left Div - Menu */}
      <div className="flex-[3] flex flex-col">
        <div className="flex items-center justify-between px-10 py-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
              Menu
            </h1>
          </div>
          <div className="flex items-center justify-around gap-4">
            <div className="flex items-center gap-3 cursor-pointer">
              <MdRestaurantMenu className="text-[#f5f5f5] text-4xl" />
              <div className="flex flex-col items-start">
                <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
                  {customerData.customerName || "اسم العميل"}
                </h1>
                <p className="text-xs text-[#ababab] font-medium">
                  طاولة: {customerData.table?.tableNo || "غير محددة"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* عرض حالات التحميل / الخطأ */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#e2bc15] mx-auto mb-4"></div>
              <p className="text-[#e2bc15] font-bold text-xl">جاري تحميل المنيو...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-500 text-xl font-bold">
              فشل تحميل المنيو: {error.message || "خطأ غير معروف"}
            </p>
          </div>
        ) : inventoryData?.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-xl">لا توجد منتجات متاحة حاليًا</p>
          </div>
        ) : (
          <MenuContainer inventoryItems={inventoryData} />  // ← مرر الداتا للكومبوننت
        )}
      </div>

      {/* Right Div */}
      <div className="flex-[1] bg-[#1a1a1a] mt-4 mr-3 h-[780px] rounded-lg pt-2 overflow-y-auto">
        <CustomerInfo />
        <hr className="border-[#2a2a2a] border-t-2" />
        <CartInfo />
        <hr className="border-[#2a2a2a] border-t-2" />
        <Bill />
      </div>

      {!isAdmin && <BottomNav />}
    </section>
  );
};

export default Menu;