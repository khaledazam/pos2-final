import React, { useState } from "react";
import { FaPlus, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTables, addTable, updateTable, deleteTable } from "../https";
import { enqueueSnackbar } from "notistack";
import { useSelector, useDispatch } from "react-redux"; // ← مهم جدًا: useDispatch
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


const Tables = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // ← ده اللي كان ناقص
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.user);
  const isAdmin = user.role?.toLowerCase() === "admin";

  const [status, setStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);
  const [formData, setFormData] = useState({ tableNo: "", seats: "" });

  useEffect(() => {
    document.title = "POS | Tables";
  }, []);

  // Fetch Tables
  const { data: resData, isLoading, isError } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
    onError: (err) => {
      console.error("Error fetching tables:", err);
      enqueueSnackbar("فشل في تحميل الطاولات", { variant: "error" });
    }
  });

  const tables = resData?.data?.data || resData?.data || [];

  // Add Table Mutation
  const addMutation = useMutation({
    mutationFn: addTable,
    onSuccess: () => {
      enqueueSnackbar("تم إضافة الطاولة بنجاح!", { variant: "success" });
      queryClient.invalidateQueries(["tables"]);
      setShowModal(false);
      resetForm();
    },
    onError: (err) => {
      enqueueSnackbar(err.response?.data?.message || "فشل في إضافة الطاولة", { variant: "error" });
    }
  });

  // Update Table Mutation
  const updateMutation = useMutation({
    mutationFn: updateTable,
    onSuccess: () => {
      enqueueSnackbar("تم تعديل الطاولة بنجاح!", { variant: "success" });
      queryClient.invalidateQueries(["tables"]);
      setShowModal(false);
      resetForm();
    },
    onError: (err) => {
      enqueueSnackbar(err.response?.data?.message || "فشل في تعديل الطاولة", { variant: "error" });
    }
  });

  // Delete Table Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      enqueueSnackbar("تم حذف الطاولة بنجاح!", { variant: "success" });
      queryClient.invalidateQueries(["tables"]);
    },
    onError: (err) => {
      enqueueSnackbar(err.response?.data?.message || "فشل في حذف الطاولة", { variant: "error" });
    }
  });

  const resetForm = () => {
    setFormData({ tableNo: "", seats: "" });
    setCurrentTable(null);
    setIsEditMode(false);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (table) => {
    setFormData({
      tableNo: table.tableNo,
      seats: table.seats
    });
    setCurrentTable(table);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.tableNo.trim()) {
      enqueueSnackbar("رقم الطاولة مطلوب", { variant: "warning" });
      return;
    }

    if (!formData.seats || Number(formData.seats) <= 0) {
      enqueueSnackbar("عدد الكراسي لازم يكون أكبر من 0", { variant: "warning" });
      return;
    }

    const payload = {
      tableNo: formData.tableNo,
      seats: Number(formData.seats)
    };

    if (isEditMode && currentTable) {
      updateMutation.mutate({ id: currentTable._id, ...payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  const handleDelete = (table) => {
    if (table.status === "Occupied") {
      enqueueSnackbar("لا يمكن حذف طاولة مشغولة", { variant: "warning" });
      return;
    }
    if (window.confirm(`هل أنت متأكد من حذف الطاولة رقم ${table.tableNo}؟`)) {
      deleteMutation.mutate(table._id);
    }
  };

  // ────────────────────────────────────────────────
  // الدالة المهمة: توجه للمنيو مع إرسال بيانات الطاولة للـ Redux
  // ────────────────────────────────────────────────
  const handleTableClick = (table) => {
    console.log("تم الضغط على طاولة:", {
      tableNo: table.tableNo,
      tableId: table._id,
      status: table.status,
      seats: table.seats
    });

    // خزن بيانات الطاولة في Redux عشان المنيو يعرفها
   dispatch((dispatch, getState) => {
    dispatch({
      type: "customer/updateTable",
      payload: {
        table: {
          _id: table._id,
          tableNo: table.tableNo,
          seats: table.seats,
          status: table.status,
        }
      }
    });
  });

  console.log("تم إرسال الطاولة للـ Redux:", table.tableNo);

    // روح لصفحة المنيو مباشرة
    navigate("/menu");
  };

  const filteredTables = tables.filter(table => {
    if (status === "all") return true;
    if (status === "booked") return table.status === "Occupied" || table.status === "Booked";
    return false;
  });

  return (
    <section className="bg-[#1a1a1a] min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#333]">
        <div>
          <h1 className="text-4xl font-black text-[#f5f5f5] flex items-center gap-3">
            🪑 Tables
          </h1>
          <p className="text-[#ababab] mt-2">إدارة طاولات المطعم</p>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-[#e2bc15] text-black px-6 py-3 rounded-xl font-bold hover:bg-white transition-all"
            >
              <FaPlus /> إضافة طاولة
            </button>
          )}

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatus("all")}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                status === "all"
                  ? "bg-white text-black"
                  : "bg-[#262626] text-[#ababab] hover:bg-[#333]"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStatus("booked")}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                status === "booked"
                  ? "bg-white text-black"
                  : "bg-[#262626] text-[#ababab] hover:bg-[#333]"
              }`}
            >
              مشغولة
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#e2bc15]"></div>
          <p className="text-[#e2bc15] font-bold">جاري تحميل الطاولات...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-32">
          <p className="text-red-500 text-xl font-bold">فشل في تحميل الطاولات</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredTables.map((table) => {
            const isAvailable = table.status === "Available";
            const isOccupied = table.status === "Occupied";

            return (
              <button
                key={table._id}
                onClick={() => handleTableClick(table)}
                disabled={table.status === "Booked"}
                className={`relative p-6 rounded-2xl border-2 transition-all w-full text-left focus:outline-none ${
                  isAvailable
                    ? "bg-[#1f1f1f] border-green-500 hover:border-[#e2bc15] cursor-pointer hover:scale-105"
                    : isOccupied
                    ? "bg-[#2d1212] border-red-500 cursor-pointer hover:scale-105"
                    : "bg-[#2d1212] border-red-500 cursor-not-allowed opacity-60"
                }`}
              >
                {/* Edit & Delete Buttons */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(table);
                      }}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(table);
                      }}
                      disabled={isOccupied}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                )}

                {/* Table Info */}
                <div className="text-center mt-4">
                  <div
                    className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-black mb-3 ${
                      isAvailable
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {table.tableNo}
                  </div>

                  <h3 className="text-xl font-bold text-[#f5f5f5] mb-2">
                    طاولة {table.tableNo}
                  </h3>

                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-[#ababab] text-sm">🪑</span>
                    <span className="text-[#ababab] text-sm font-bold">
                      {table.seats} كراسي
                    </span>
                  </div>

                  <div
                    className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                      isAvailable
                        ? "bg-green-500/20 text-green-400"
                        : isOccupied
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-300"
                    }`}
                  >
                    {isAvailable ? "🟢 متاحة" : isOccupied ? "🔴 مشغولة" : "محجوزة"}
                  </div>

                  {isOccupied && table.currentOrder?.customerDetails?.name && (
                    <div className="mt-3 p-2 bg-black/40 rounded-lg">
                      <p className="text-xs text-[#ababab]">العميل:</p>
                      <p className="text-sm font-bold text-[#f5f5f5]">
                        {table.currentOrder.customerDetails.name}
                      </p>
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {filteredTables.length === 0 && (
            <div className="col-span-full text-center py-32">
              <p className="text-[#ababab] text-xl font-bold mb-4">
                {status === "booked" ? "لا توجد طاولات مشغولة" : "لا توجد طاولات"}
              </p>
              {isAdmin && status === "all" && (
                <button
                  onClick={openAddModal}
                  className="text-[#e2bc15] text-lg hover:underline font-bold"
                >
                  أضف طاولتك الأولى
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-[#1a1a1a] p-10 rounded-3xl w-full max-w-lg shadow-2xl border border-[#333]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-[#f5f5f5]">
                {isEditMode ? "تعديل الطاولة" : "إضافة طاولة جديدة"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#ababab] hover:text-white text-3xl"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <label className="block text-lg font-bold text-[#ababab] mb-2">
                  رقم/اسم الطاولة
                </label>
                <input
                  type="text"
                  placeholder="مثال: 1 أو A1 أو VIP-1"
                  value={formData.tableNo}
                  onChange={(e) =>
                    setFormData({ ...formData, tableNo: e.target.value })
                  }
                  className="w-full p-4 bg-[#262626] border-2 border-[#333] rounded-xl text-[#f5f5f5] text-lg font-bold focus:outline-none focus:border-[#e2bc15]"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-[#ababab] mb-2">
                  عدد الكراسي
                </label>
                <input
                  type="number"
                  placeholder="مثال: 4"
                  value={formData.seats}
                  onChange={(e) =>
                    setFormData({ ...formData, seats: e.target.value })
                  }
                  className="w-full p-4 bg-[#262626] border-2 border-[#333] rounded-xl text-[#f5f5f5] text-lg font-bold focus:outline-none focus:border-[#e2bc15]"
                  required
                  min="1"
                />
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  type="submit"
                  disabled={addMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-4 bg-[#e2bc15] text-black font-black rounded-xl text-lg hover:bg-white transition-all disabled:opacity-50"
                >
                  {addMutation.isPending || updateMutation.isPending
                    ? "جاري الحفظ..."
                    : isEditMode
                    ? "تحديث الطاولة"
                    : "إنشاء طاولة"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 py-4 bg-[#333] text-white font-bold rounded-xl text-lg hover:bg-[#444] transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Tables;