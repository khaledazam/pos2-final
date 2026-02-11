import React, { useEffect, useRef } from "react";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { removeItem } from "../../redux/slices/cartSlice";
import { formatCurrency } from "../../utils/index";

const CartInfo = () => {
  const cartItems = useSelector((state) => state.cart); // أفضل تسمية
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  // Scroll to bottom فقط عند إضافة عنصر جديد (مش كل render)
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      // لو المستخدم قريب من الأسفل → ننزل تلقائيًا
      const isNearBottom =
        scrollHeight - scrollRef.current.scrollTop - clientHeight < 100;

      if (isNearBottom) {
        scrollRef.current.scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [cartItems.length]); // ← نعتمد على عدد العناصر مش الكائن كله

  const handleRemove = (itemId) => {
    dispatch(removeItem(itemId));
  };

  return (
    <div className="px-4 py-2">
      <h1 className="text-lg text-[#e4e4e4] font-semibold tracking-wide">
        تفاصيل الطلب
      </h1>

      <div
        ref={scrollRef}
        className="mt-4 overflow-y-auto scrollbar-hide max-h-[380px]"
      >
        {cartItems.length === 0 ? (
          <div className="flex justify-center items-center h-[300px] text-[#ababab] text-sm">
            السلة فارغة، ابدأ بإضافة عناصر!
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id} // أو item._id حسب اللي موجود فعليًا
              className="bg-[#1f1f1f] rounded-lg px-4 py-4 mb-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-[#e0e0e0] font-medium text-base">
                  {item.name}
                </h2>
                <span className="text-[#ababab] font-semibold text-sm">
                  ×{item.quantity}
                </span>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4">
                  <RiDeleteBin2Fill
                    onClick={() => handleRemove(item.id)} // ← تأكد إن المفتاح id أو _id
                    className="text-red-400 hover:text-red-300 cursor-pointer transition-colors"
                    size={22}
                  />
                  <FaNotesMedical
                    className="text-[#ababab] hover:text-white cursor-pointer transition-colors"
                    size={22}
                  />
                </div>

                <p className="text-[#f5f5f5] font-bold text-base">
                  {formatCurrency(item.price)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CartInfo;