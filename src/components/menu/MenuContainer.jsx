import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";
import { useQuery } from "@tanstack/react-query";
import { getInventory } from "../../https";

const MenuContainer = () => {
  const dispatch = useDispatch();
  const [countMap, setCountMap] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");

  // ────────────────────────────────────────────────
  // استخدام useQuery مع إعدادات أفضل للاستقرار
  // ────────────────────────────────────────────────
  const { 
    data: response, 
    isLoading, 
    error, 
    isFetching 
  } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await getInventory();
      return res.data; // { success: true, count: 174, data: [...] }
    },
    staleTime: 1000 * 60 * 10,          // 10 دقائق – يقلل الـ refetch التلقائي
    gcTime: 1000 * 60 * 60,             // ساعة – يحتفظ بالكاش أطول
    placeholderData: (previousData) => previousData,  // يحتفظ بالبيانات القديمة أثناء التحديث
    refetchOnWindowFocus: false,        // مهم جدًا لتجنب الـ flicker عند الرجوع للتب
    refetchOnReconnect: false,
  });

  // ────────────────────────────────────────────────
  // نسخة مستقرة من المنتجات لتجنب الاختفاء المؤقت
  // ────────────────────────────────────────────────
  const [stableItems, setStableItems] = useState([]);

  useEffect(() => {
    if (response?.data?.data && Array.isArray(response.data.data)) {
      setStableItems(response.data.data);
      console.log("تم تحديث stableItems:", response.data.data.length, "منتج");
    }
  }, [response]);

  const menuItems = stableItems;

  // استخراج الفئات من المنتجات المستقرة
  const categories = ["All", ...new Set(menuItems.map(item => item.category).filter(Boolean))];

  // فلترة حسب الفئة المختارة
  const itemsToShow = selectedCategory === "All"
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const increment = (id) => {
    setCountMap((prev) => ({
      ...prev,
      [id]: (prev[id] || 1) + 1,
    }));
  };

  const decrement = (id) => {
    setCountMap((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 1) - 1, 1),
    }));
  };

  const addToCart = (item) => {
    const qty = countMap[item._id] || 1;
    dispatch(
      addItems({
        id: item._id,
        name: item.name,
        quantity: qty,
        pricePerQuantity: item.price,
        price: item.price * qty,
      })
    );
  };

  // ────────────────────────────────────────────────
  // حالات التحميل والأخطاء
  // ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <p className="p-6 text-white text-center text-lg">
        جاري تحميل القائمة...
      </p>
    );
  }

  if (error) {
    console.error("خطأ في جلب المنتجات:", error);
    return (
      <p className="p-6 text-red-500 text-center text-lg">
        فشل تحميل القائمة: {error.message || "خطأ غير معروف"}
      </p>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="p-6">
        <p className="text-white text-center text-lg">
          لم يتم العثور على عناصر في القائمة
        </p>
      </div>
    );
  }

  return (
  <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
    {/* Header أو أي محتوى علوي إذا كان موجود */}
    {/* <Header /> مثلاً */}

    {/* الـ container الرئيسي للمنيو */}
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Category Tabs - sticky + scrollable horizontally */}
      <div className="sticky top-0 z-20 bg-[#0f0f0f] border-b border-gray-800 shadow-md">
        <div className="flex gap-2.5 px-4 py-3 overflow-x-auto scrollbar-hide whitespace-nowrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-5 py-2.5 rounded-full font-medium text-sm transition-all flex-shrink-0
                ${
                  selectedCategory === category
                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              {category === "All" ? "الكل" : category}
              <span className="ml-1.5 text-xs opacity-75">
                ({category === "All" ? menuItems.length : menuItems.filter(i => i.category === category).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* منطقة المنتجات - scrollable رأسيًا */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
        {isFetching && !isLoading && (
          <div className="text-center text-gray-400 py-3 text-sm">
            جاري تحديث القائمة...
          </div>
        )}

        {itemsToShow.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-400 text-lg">
            لا توجد منتجات في هذا التصنيف
          </div>
        ) : (
          <div className="
            grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 
            lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 
            gap-4 sm:gap-5 md:gap-6
          ">
            {itemsToShow.map((item) => (
              <div
                key={item._id}
                className="
                  bg-[#1a1a1a] rounded-xl overflow-hidden
                  shadow-md hover:shadow-xl hover:shadow-black/30
                  transition-all duration-300
                  flex flex-col h-full
                "
              >
                {/* صورة المنتج لو موجودة */}
                {/* {item.image && <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />} */}

                <div className="p-4 flex flex-col flex-1">
                  {item.category && (
                    <span className="text-xs text-gray-400 mb-1.5 inline-block">
                      {item.category}
                    </span>
                  )}

                  <h3 className="font-semibold text-base md:text-lg mb-1.5 line-clamp-2">
                    {item.name}
                  </h3>

                  <div className="mt-auto flex items-center justify-between">
                    <p className="text-yellow-400 font-bold text-lg">
                      {item.price} ج.م
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decrement(item._id)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full hover:bg-gray-600 transition"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">
                        {countMap[item._id] || 1}
                      </span>
                      <button
                        onClick={() => increment(item._id)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full hover:bg-gray-600 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(item)}
                    className="
                      mt-4 w-full py-2.5 rounded-lg font-medium
                      bg-yellow-500 hover:bg-yellow-400 text-black
                      transition-colors duration-200
                    "
                  >
                    إضافة للسلة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Footer أو أي محتوى سفلي إذا كان موجود */}
    {/* <Footer /> */}
  </div>
);
};

export default MenuContainer;