import React, { useState, useMemo } from "react";
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

  const userState = useSelector((state) => state.user);
  const currentUser = userState?.user || {};
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  // Fetch inventory
  const { data: rawResponse, isLoading, error, isFetching } = useQuery({
    queryKey: ["inventory"],
    queryFn: getInventory,
    staleTime: 1000 * 60 * 3, // 3 دقايق – توازن بين السرعة والتحديث
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  // استخراج المنتجات بأمان
  const menuItems = useMemo(() => rawResponse?.data?.data || [], [rawResponse]);

  const categories = useMemo(
    () => ["All", ...new Set(menuItems.map((item) => item?.category).filter(Boolean))],
    [menuItems]
  );

  const itemsToShow = useMemo(
    () =>
      selectedCategory === "All"
        ? menuItems
        : menuItems.filter((item) => item?.category === selectedCategory),
    [menuItems, selectedCategory]
  );

  // ────────────────────────────────────────────────
  // Mutations مع تحسين الاستقرار
  // ────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: updateInventoryItem,

    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey: ["inventory"] });
      const previous = queryClient.getQueryData(["inventory"]);

      queryClient.setQueryData(["inventory"], (old = { data: { data: [] } }) => ({
        ...old,
        data: {
          ...old?.data,
          data: (old?.data?.data || []).map((item) =>
            item._id === updatedItem.id ? { ...item, ...updatedItem } : item
          ),
        },
      }));

      return { previous };
    },

    onSettled: () => {
      // refetch بعد النجاح أو الفشل – ده بيضمن الاستقرار
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },

    onSuccess: () => {
      enqueueSnackbar("تم تحديث المنتج بنجاح", { variant: "success" });
      setShowEditModal(false);
      setEditingItem(null);
    },

    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["inventory"], context.previous);
      }
      enqueueSnackbar("فشل تحديث المنتج", { variant: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInventoryItem,

    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["inventory"] });
      const previous = queryClient.getQueryData(["inventory"]);

      queryClient.setQueryData(["inventory"], (old = { data: { data: [] } }) => ({
        ...old,
        data: {
          ...old?.data,
          data: (old?.data?.data || []).filter((item) => item._id !== deletedId),
        },
      }));

      return { previous };
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },

    onSuccess: () => {
      enqueueSnackbar("تم حذف المنتج بنجاح", { variant: "success" });
    },

    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["inventory"], context.previous);
      }
      enqueueSnackbar("فشل حذف المنتج", { variant: "error" });
    },
  });

  // Handlers
  const increment = (id) => setCountMap((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
  const decrement = (id) =>
    setCountMap((prev) => ({ ...prev, [id]: Math.max((prev[id] || 1) - 1, 1) }));

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
    if (!window.confirm(`هل أنت متأكد من حذف "${item.name}"؟`)) return;
    deleteMutation.mutate(item._id);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    updateMutation.mutate({
      id: editingItem._id,
      name: editingItem.name,
      price: editingItem.price,
      category: editingItem.category,
      description: editingItem.description,
    });
  };

  // ────────────────────────────────────────────────
  // Rendering
  // ────────────────────────────────────────────────
  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500" />
          <p className="text-gray-300 text-lg font-medium">جاري تحميل القائمة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#0a0a0a] min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-red-500 text-xl mb-4">فشل تحميل القائمة</p>
          <p className="text-gray-400 mb-6">{error?.message || "حدث خطأ غير متوقع"}</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["inventory"] })}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3.5 rounded-xl font-bold transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="p-6 bg-[#0a0a0a] min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-white text-2xl mb-3">لا توجد منتجات حاليًا</p>
          <p className="text-gray-400">سيتم عرض المنتجات فور إضافتها</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
      {/* Categories */}
      <div className="sticky top-0 z-20 bg-[#0f0f0f] border-b border-gray-800 shadow-md">
        <div className="flex gap-2.5 px-4 py-3 overflow-x-auto scrollbar-hide whitespace-nowrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all flex-shrink-0 ${
                selectedCategory === category
                  ? "bg-yellow-500 text-black shadow-lg"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {category === "All" ? "الكل" : category}
              <span className="ml-1.5 text-xs opacity-75">
                ({category === "All" ? menuItems.length : itemsToShow.length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
        {itemsToShow.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-400 text-lg">
            لا توجد منتجات في هذا التصنيف
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {itemsToShow.map((item) => (
              <div
                key={item._id}
                className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full relative"
              >
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition"
                      title="تعديل"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deleteMutation.isPending}
                      className={`bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg shadow-lg transition ${
                        deleteMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      title="حذف"
                    >
                      {deleteMutation.isPending ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                )}

                <div className="p-4 flex flex-col flex-1">
                  {item.category && <span className="text-xs text-gray-400 mb-1.5">{item.category}</span>}
                  <h3 className="font-semibold text-base md:text-lg mb-1.5 line-clamp-2">{item.name}</h3>
                  <div className="mt-auto flex items-center justify-between">
                    <p className="text-yellow-400 font-bold text-lg">{item.price} ج.م</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decrement(item._id)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full hover:bg-gray-600 transition"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">{countMap[item._id] || 1}</span>
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
                    className="mt-4 w-full py-2.5 rounded-lg font-medium bg-yellow-500 hover:bg-yellow-400 text-black transition-colors"
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
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
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
              {/* باقي الحقول كما هي ... */}
              {/* ... السعر، الفئة، الوصف ... */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition disabled:opacity-50"
                >
                  {updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
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