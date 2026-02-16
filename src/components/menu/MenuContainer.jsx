import React, { useState } from "react";
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
  const user = userState?.user || userState;
  const isAdmin = user?.role?.toLowerCase() === "admin";

  // ✅ DETAILED DEBUGGING
  const {
    data: rawData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await getInventory();
      
      console.log("═══════════════════════════════");
      console.log("🔍 RAW RESPONSE:", res);
      console.log("🔍 res.data:", res?.data);
      console.log("🔍 res.data.data:", res?.data?.data);
      console.log("🔍 res.data.data.data:", res?.data?.data?.data);
      console.log("🔍 Type of res.data:", typeof res?.data);
      console.log("🔍 Is Array res.data:", Array.isArray(res?.data));
      console.log("🔍 Is Array res.data.data:", Array.isArray(res?.data?.data));
      console.log("═══════════════════════════════");
      
      return res; // Return the whole response for now
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // ✅ Extract menuItems safely
  let menuItems = [];
  
  if (rawData) {
    console.log("🎯 Processing rawData:", rawData);
    
    // Try different paths
    if (Array.isArray(rawData)) {
      menuItems = rawData;
      console.log("✅ Path 1: rawData is array");
    } else if (Array.isArray(rawData?.data?.data?.data)) {
      menuItems = rawData.data.data.data;
      console.log("✅ Path 2: data.data.data");
    } else if (Array.isArray(rawData?.data?.data)) {
      menuItems = rawData.data.data;
      console.log("✅ Path 3: data.data");
    } else if (Array.isArray(rawData?.data)) {
      menuItems = rawData.data;
      console.log("✅ Path 4: data");
    } else {
      console.error("❌ Could not find array in:", rawData);
    }
    
    console.log("📊 Final menuItems:", menuItems);
    console.log("📊 menuItems length:", menuItems?.length);
    console.log("📊 menuItems type:", typeof menuItems);
    console.log("📊 Is Array:", Array.isArray(menuItems));
  }

  const categories = ["All", ...new Set((menuItems || []).map(item => item?.category).filter(Boolean))];
  const itemsToShow = selectedCategory === "All" ? (menuItems || []) : (menuItems || []).filter(item => item?.category === selectedCategory);

  // Rest of your mutations...
  const updateMutation = useMutation({
    mutationFn: updateInventoryItem,
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey: ["inventory"] });
      const previousItems = queryClient.getQueryData(["inventory"]);
      queryClient.setQueryData(["inventory"], (old = []) => old.map(item => item._id === updatedItem.id ? { ...item, ...updatedItem } : item));
      return { previousItems };
    },
    onSuccess: () => {
      enqueueSnackbar("تم تحديث المنتج بنجاح!", { variant: "success" });
      setShowEditModal(false);
      setEditingItem(null);
    },
    onError: (err, _, context) => {
      if (context?.previousItems) queryClient.setQueryData(["inventory"], context.previousItems);
      enqueueSnackbar(err.response?.data?.message || "فشل تحديث المنتج", { variant: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInventoryItem,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["inventory"] });
      const previousItems = queryClient.getQueryData(["inventory"]);
      queryClient.setQueryData(["inventory"], (old = []) => old.filter(item => item._id !== deletedId));
      return { previousItems };
    },
    onSuccess: () => enqueueSnackbar("تم حذف المنتج بنجاح!", { variant: "success" }),
    onError: (err, _, context) => {
      if (context?.previousItems) queryClient.setQueryData(["inventory"], context.previousItems);
      enqueueSnackbar(err.response?.data?.message || "فشل حذف المنتج", { variant: "error" });
    },
  });

  const increment = (id) => setCountMap((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
  const decrement = (id) => setCountMap((prev) => ({ ...prev, [id]: Math.max((prev[id] || 1) - 1, 1) }));
  const addToCart = (item) => {
    const qty = countMap[item._id] || 1;
    dispatch(addItems({ id: item._id, name: item.name, quantity: qty, pricePerQuantity: item.price, price: item.price * qty }));
    enqueueSnackbar(`تم إضافة ${item.name} للسلة`, { variant: "success" });
  };
  const handleEdit = (item) => { setEditingItem({ ...item }); setShowEditModal(true); };
  const handleDelete = (item) => { if (window.confirm(`هل أنت متأكد من حذف "${item.name}"؟`)) deleteMutation.mutate(item._id); };
  const handleSaveEdit = (e) => { e.preventDefault(); updateMutation.mutate({ id: editingItem._id, name: editingItem.name, price: editingItem.price, category: editingItem.category, description: editingItem.description }); };

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-[#0a0a0a]"><div className="flex flex-col items-center gap-6"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500"></div><p className="text-gray-300 text-lg font-medium">جاري تحميل القائمة...</p></div></div>;
  
  if (error) {
    console.error("❌ Query Error:", error);
    return <div className="p-6 bg-[#0a0a0a] min-h-screen flex items-center justify-center"><div className="text-center max-w-md"><p className="text-red-500 text-xl mb-4">فشل تحميل القائمة</p><p className="text-gray-400 mb-6">{error.response?.status === 403 ? "ليس لديك صلاحية" : error.message}</p><button onClick={() => queryClient.invalidateQueries({ queryKey: ["inventory"] })} className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3.5 rounded-xl font-bold transition">إعادة المحاولة</button></div></div>;
  }
  
  if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
    console.warn("⚠️ No valid menu items:", menuItems);
    return <div className="p-6 bg-[#0a0a0a] min-h-screen flex items-center justify-center"><div className="text-center"><svg className="w-28 h-28 mx-auto mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p className="text-white text-2xl mb-3">لا توجد منتجات</p><p className="text-gray-400">rawData type: {typeof rawData}</p></div></div>;
  }

  console.log("🎉 Rendering with", menuItems.length, "items");

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
      <div className="sticky top-0 z-20 bg-[#0f0f0f] border-b border-gray-800 shadow-md">
        <div className="flex gap-2.5 px-4 py-3 overflow-x-auto scrollbar-hide whitespace-nowrap">
          {categories.map((category) => (
            <button key={category} onClick={() => setSelectedCategory(category)} className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all flex-shrink-0 ${selectedCategory === category ? 'bg-yellow-500 text-black shadow-lg' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
              {category === "All" ? "الكل" : category}<span className="ml-1.5 text-xs opacity-75">({category === "All" ? menuItems.length : menuItems.filter(i => i?.category === category).length})</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
        {itemsToShow.length === 0 ? <div className="flex items-center justify-center h-64 text-gray-400 text-lg">لا توجد منتجات في هذا التصنيف</div> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {itemsToShow.map((item) => (
              <div key={item._id} className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <button onClick={() => handleEdit(item)} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition" title="تعديل"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                    <button onClick={() => handleDelete(item)} disabled={deleteMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg shadow-lg transition disabled:opacity-50" title="حذف">{deleteMutation.isPending ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}</button>
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  {item.category && <span className="text-xs text-gray-400 mb-1.5">{item.category}</span>}
                  <h3 className="font-semibold text-base md:text-lg mb-1.5 line-clamp-2">{item.name}</h3>
                  <div className="mt-auto flex items-center justify-between">
                    <p className="text-yellow-400 font-bold text-lg">{item.price} ج.م</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => decrement(item._id)} className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full hover:bg-gray-600 transition">−</button>
                      <span className="w-8 text-center font-medium">{countMap[item._id] || 1}</span>
                      <button onClick={() => increment(item._id)} className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full hover:bg-gray-600 transition">+</button>
                    </div>
                  </div>
                  <button onClick={() => addToCart(item)} className="mt-4 w-full py-2.5 rounded-lg font-medium bg-yellow-500 hover:bg-yellow-400 text-black transition-colors">إضافة للسلة</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full border border-gray-800" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6 text-yellow-500">تعديل المنتج</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div><label className="block text-sm font-medium mb-2 text-gray-300">اسم المنتج</label><input type="text" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500" required /></div>
              <div><label className="block text-sm font-medium mb-2 text-gray-300">السعر</label><input type="number" step="0.01" value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })} className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500" required /></div>
              <div><label className="block text-sm font-medium mb-2 text-gray-300">الفئة</label><input type="text" value={editingItem.category || ""} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500" /></div>
              <div><label className="block text-sm font-medium mb-2 text-gray-300">الوصف</label><textarea value={editingItem.description || ""} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 h-24 resize-none" /></div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={updateMutation.isPending} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition disabled:opacity-50">{updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}</button>
                <button type="button" onClick={() => { setShowEditModal(false); setEditingItem(null); }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuContainer;