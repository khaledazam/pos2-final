import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";
import { useQuery } from "@tanstack/react-query";
import { getInventory } from "../../https";

const MenuContainer = () => {
  const dispatch = useDispatch();
  const [countMap, setCountMap] = useState({});

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await getInventory();
      return res.data; // → { success: true, data: [ ... ] }
    },
  });

  // Debug – keep for a while to confirm data shape
  useEffect(() => {
    console.log("Raw API response:", response);
    if (error) console.error("Query error:", error);
  }, [response, error]);

  // ────────────────────────────────────────────────
  // Convert object → array (this is the important fix)
  // response.data.data is the actual array of items
  // ────────────────────────────────────────────────
  const menuItems = Array.isArray(response?.data.data)
    ? response.data.data
    : [];

  // For now: show ALL items (no filtering)
  // Later → you can add .filter() again when you know if/where "available" exists
  const itemsToShow = menuItems;

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

  if (isLoading) {
    return (
      <p className="p-6 text-white text-center text-lg">
        جاري تحميل القائمة...
      </p>
    );
  }

  if (error) {
    return (
      <p className="p-6 text-red-500 text-center text-lg">
        فشل تحميل القائمة: {error.message || "خطأ غير معروف"}
      </p>
    );
  }

  // Debug info on screen (remove later if you want)
  const debugInfo = (
    <div className="bg-gray-800/70 p-4 mb-6 rounded-lg text-sm text-gray-300">
      <p>Items found: <strong>{itemsToShow.length}</strong></p>
      <p>Path used: response.data.data</p>
    </div>
  );

  if (itemsToShow.length === 0) {
    return (
      <div className="p-6">
        {debugInfo}
        <p className="text-white text-center text-lg">
          لم يتم العثور على عناصر في القائمة
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {debugInfo}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {itemsToShow.map((item) => (
          <div
            key={item._id}
            className="bg-[#1e1e1e] rounded-xl p-4 shadow-lg flex flex-col justify-between hover:bg-[#2a2a2a] transition"
          >
            <div>
              <h2 className="text-white text-lg font-semibold mb-2 truncate">
                {item.name}
              </h2>
              <p className="text-yellow-400 font-bold text-md">
                {item.price} جنيه
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => decrement(item._id)}
                  className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                >
                  -
                </button>
                <span className="text-white font-medium min-w-[2rem] text-center">
                  {countMap[item._id] || 1}
                </span>
                <button
                  onClick={() => increment(item._id)}
                  className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => addToCart(item)}
                className="bg-yellow-500 text-black font-semibold px-5 py-1.5 rounded hover:bg-yellow-400 transition"
              >
                إضافة
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuContainer;