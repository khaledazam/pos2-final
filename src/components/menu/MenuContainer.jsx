import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInventory, updateInventoryItem, deleteInventoryItem } from "../../https";
import { enqueueSnackbar } from "notistack";

const MenuContainer = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  
  const [countMap, setCountMap] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // ✅ Get user role from Redux - Fixed!
  const userState = useSelector((state) => state.user);
  
  // Handle both possible Redux structures:
  // 1. { user: { role: "admin" } }
  // 2. { isAuth: true, user: { role: "admin" } }
  const user = userState?.user || userState;
  const isAdmin = user?.role?.toLowerCase() === "admin";
  
  // ✅ Debug logs (remove in production)
  console.log("🔍 User State:", userState);
  console.log("👤 User:", user);
  console.log("🔑 Role:", user?.role);
  console.log("👑 Is Admin:", isAdmin);

  // ────────────────────────────────────────────────
  // Fetch Inventory
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
      console.log("📦 Inventory Response:", res.data);
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const [stableItems, setStableItems] = useState([]);

  useEffect(() => {
    if (response?.data?.data && Array.isArray(response.data.data)) {
      setStableItems(response.data.data);
      console.log("✅ تم تحديث stableItems:", response.data.data.length, "منتج");
    } else if (response?.data && Array.isArray(response.data)) {
      // Handle if response structure is different
      setStableItems(response.data);
      console.log("✅ تم تحديث stableItems:", response.data.length, "منتج");
    }
  }, [response]);

  const menuItems = stableItems;
  const categories = ["All", ...new Set(menuItems.map(item => item.category).filter(Boolean))];
  
  const itemsToShow = selectedCategory === "All"
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  // ────────────────────────────────────────────────
  // Update Item Mutation
  // ────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: updateInventoryItem,
    onSuccess: () => {
      enqueueSnackbar("تم تحديث المنتج بنجاح!", { variant: "success" });
      queryClient.invalidateQueries(["inventory"]);
      setShowEditModal(false);
      setEditingItem(null);
    },
    onError: (err) => {
      console.error("❌ Update Error:", err);
      enqueueSnackbar(err.response?.data?.message || "فشل تحديث المنتج", { variant: "error" });
    }
  });

  // ────────────────────────────────────────────────
  // Delete Item Mutation
  // ────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: () => {
      enqueueSnackbar("تم حذف المنتج بنجاح!", { variant: "success" });
      queryClient.invalidateQueries(["inventory"]);
    },
    onError: (err) => {
      console.error("❌ Delete Error:", err);
      enqueueSnackbar(err.response?.data?.message || "فشل حذف المنتج", { variant: "error" });
    }
  });

  // ────────────────────────────────────────────────
  // Handlers
  // ────────────────────────────────────────────────
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
    enqueueSnackbar(`تم إضافة ${item.name} للسلة`, { variant: "success" });
  };

  const handleEdit = (item) => {
    setEditingItem({ ...item });
    setShowEditModal(true);
  };

  const handleDelete = (item) => {
    if (window.confirm(`هل أنت متأكد من حذف "${item.name}"؟`)) {
      deleteMutation.mutate(item._id);
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      id: editingItem._id,
      name: editingItem.name,
      price: editingItem.price,
      category: editingItem.category,
      description: editingItem.description,
    });
  };

  // ────────────────────────────────────────────────
  // Loading & Error States
  // ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p className="text-gray-400">جاري تحميل القائمة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("❌ خطأ في جلب المنتجات:", error);
    return (
      <div className="p-6 bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">
            فشل تحميل القائمة
          </p>
          <p className="text-gray-400 mb-4">
            {error.response?.status === 403 
              ? "ليس لديك صلاحية للوصول" 
              : error.message || "خطأ غير معروف"}
          </p>
          <button
            onClick={() => queryClient.invalidateQueries(["inventory"])}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="p-6 bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-2">
            لم يتم العثور على عناصر في القائمة
          </p>
          <p className="text-gray-400">
            {isFetching ? "جاري التحميل..." : "لا توجد منتجات متاحة"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
      {/* Category Tabs */}
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

      {/* Products Grid */}
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
                  relative
                "
              >
                {/* Admin Actions - Only show if user is Admin */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition-all"
                      title="تعديل"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deleteMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg shadow-lg transition-all disabled:opacity-50"
                      title="حذف"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}

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

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full border border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-yellow-500">تعديل المنتج</h2>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">اسم المنتج</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">السعر</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                  className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">الفئة</label>
                <input
                  type="text"
                  value={editingItem.category || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">الوصف</label>
                <textarea
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 h-24 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuContainer;