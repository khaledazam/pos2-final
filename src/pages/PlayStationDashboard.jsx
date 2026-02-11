import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FaPlus, FaGamepad, FaPlay, FaStop, FaClock, FaMoneyBillWave, FaCircle, FaEdit, FaTrash } from "react-icons/fa";
import {
  getPlayStations,
  addPlayStation,
  updatePlayStation,
  deletePlayStation,
  startPSSession,
  endPSSession,
  getPSInvoice
} from "../https";
import { useSelector } from "react-redux";

const PlayStationDashboard = () => {
  const queryClient = useQueryClient();

  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [timers, setTimers] = useState({});

  // حالات الـ CRUD
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPS, setCurrentPS] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "PS5",
    pricePerHour: "",
  });

  // const user = useSelector((state) => state.user || {});
  // const userRole = user?.role?.toLowerCase() || "";
  // const isAdmin = userRole === "admin";
  // const isCashier = userRole === "cashier";

  const canManageDevices = true;
  const canManageSessions = true;

  // Fetch PlayStations
  const { data: psData, isLoading, error } = useQuery({
    queryKey: ["playstations"],
    queryFn: getPlayStations,
    refetchInterval: 10000,
    onError: (err) => {
      console.error("خطأ في جلب الأجهزة:", err);
      enqueueSnackbar("فشل تحميل الأجهزة", { variant: "error" });
    },
  });

  const playStations = Array.isArray(psData?.data?.data)
    ? psData.data.data
    : Array.isArray(psData?.data)
      ? psData.data
      : [];

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};
      playStations.forEach((ps) => {
        if (ps.status === "occupied" && ps.currentSessionId?.startTime) {
          const start = new Date(ps.currentSessionId.startTime);
          const now = new Date();
          const diffSeconds = Math.floor((now - start) / 1000);
          const hours = Math.floor(diffSeconds / 3600);
          const minutes = Math.floor((diffSeconds % 3600) / 60);
          const seconds = diffSeconds % 60;

          newTimers[ps._id] = {
            formatted: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
            price: ((diffSeconds / 3600) * (ps.currentSessionId.pricePerHourSnapshot || ps.pricePerHour)).toFixed(2),
          };
        }
      });
      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [playStations]);

  // Mutations للجلسات
  const startSessionMutation = useMutation({
    mutationFn: startPSSession,
    onSuccess: () => {
      enqueueSnackbar("تم بدء الجلسة!", { variant: "success" });
      queryClient.invalidateQueries(["playstations"]);
    },
    onError: (err) => enqueueSnackbar(err.response?.data?.message || "فشل في بدء الجلسة", { variant: "error" }),
  });

  const endSessionMutation = useMutation({
    mutationFn: endPSSession,
    onSuccess: (data) => {
      enqueueSnackbar("تم إنهاء الجلسة!", { variant: "success" });
      queryClient.invalidateQueries(["playstations"]);
      if (data?.data?.invoice) {
        setInvoiceData(data.data.invoice);
        setShowInvoice(true);
      }
    },
    onError: (err) => enqueueSnackbar(err.response?.data?.message || "فشل في إنهاء الجلسة", { variant: "error" }),
  });

  // Mutations للـ CRUD
  const addMutation = useMutation({
    mutationFn: addPlayStation,
    onSuccess: () => {
      enqueueSnackbar("تم إضافة الجهاز!", { variant: "success" });
      queryClient.invalidateQueries(["playstations"]);
      setShowModal(false);
      resetForm();
    },
    onError: (err) => enqueueSnackbar("فشل في الإضافة", { variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: updatePlayStation,
    onSuccess: () => {
      enqueueSnackbar("تم تعديل الجهاز!", { variant: "success" });
      queryClient.invalidateQueries(["playstations"]);
      setShowModal(false);
      resetForm();
    },
    onError: (err) => enqueueSnackbar("فشل في التعديل", { variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlayStation,
    onSuccess: () => {
      enqueueSnackbar("تم حذف الجهاز!", { variant: "success" });
      queryClient.invalidateQueries(["playstations"]);
    },
    onError: (err) => enqueueSnackbar("فشل في الحذف", { variant: "error" }),
  });

  const resetForm = () => {
    setFormData({ name: "", type: "PS5", pricePerHour: "" });
    setCurrentPS(null);
    setIsEditMode(false);
  };

  const openAddModal = () => {
    if (!canManageDevices) return enqueueSnackbar("غير مصرح لك", { variant: "error" });
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (ps) => {
    if (!canManageDevices) return enqueueSnackbar("غير مصرح لك", { variant: "error" });
    setFormData({
      name: ps.name,
      type: ps.type,
      pricePerHour: ps.pricePerHour,
    });
    setCurrentPS(ps);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canManageDevices) return enqueueSnackbar("غير مصرح لك", { variant: "error" });

    if (!formData.name.trim()) return enqueueSnackbar("اسم الجهاز مطلوب", { variant: "warning" });
    if (!formData.pricePerHour || Number(formData.pricePerHour) <= 0) return enqueueSnackbar("السعر مطلوب وأكبر من 0", { variant: "warning" });

    const payload = {
      name: formData.name,
      type: formData.type,
      pricePerHour: Number(formData.pricePerHour),
    };

    if (isEditMode && currentPS) {
      updateMutation.mutate({ id: currentPS._id, ...payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  const handleDelete = (ps) => {
    if (!canManageDevices) return enqueueSnackbar("غير مصرح لك", { variant: "error" });
    if (ps.status === "occupied") return enqueueSnackbar("مشغول، أنهِ الجلسة أولاً", { variant: "warning" });
    if (window.confirm(`حذف ${ps.name}؟`)) deleteMutation.mutate(ps._id);
  };

  const handleStartSession = (psId) => {
    if (!canManageSessions) return enqueueSnackbar("غير مصرح لك", { variant: "error" });
    startSessionMutation.mutate(psId);
  };

  const handleEndSession = (sessionId) => {
    if (!canManageSessions) return enqueueSnackbar("غير مصرح لك", { variant: "error" });
    if (window.confirm("إنهاء الجلسة؟")) endSessionMutation.mutate(sessionId);
  };

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <FaGamepad className="text-5xl text-[#e2bc15]" />
          <div>
            <h1 className="text-4xl font-black text-[#e2bc15]">منطقة البلايستيشن</h1>
            <p className="text-gray-400 mt-1">إدارة الأجهزة والجلسات</p>
          </div>
        </div>

        {canManageDevices && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-3 bg-[#e2bc15] text-black px-8 py-4 rounded-2xl font-black hover:bg-white transition-all shadow-xl"
          >
            <FaPlus /> إضافة جهاز جديد
          </button>
        )}
      </div>

      {/* Loading / Error / Empty */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-[#e2bc15]"></div>
          <p className="mt-6 text-xl text-[#e2bc15] font-bold">جاري تحميل...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">
          <p className="text-2xl font-bold">فشل التحميل</p>
          <p>{error.message}</p>
        </div>
      ) : playStations.length === 0 ? (
        <div className="text-center py-32">
          <FaGamepad className="mx-auto text-9xl text-gray-700 mb-8" />
          <h3 className="text-3xl font-bold text-gray-400 mb-4">لا توجد أجهزة</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playStations.map((ps) => {
            const isOccupied = ps.status === "occupied";
            const timer = timers[ps._id];

            return (
              <div
                key={ps._id}
                className={`rounded-3xl p-6 border transition-all duration-300 ${
                  isOccupied
                    ? "bg-gradient-to-br from-red-950 to-black border-red-600 shadow-2xl shadow-red-900/50"
                    : "bg-gradient-to-br from-gray-900 to-black border-gray-700 hover:border-[#e2bc15] hover:shadow-xl hover:shadow-[#e2bc15]/20"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${isOccupied ? "bg-red-600" : "bg-[#e2bc15]"} text-black`}>
                      <FaGamepad size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">{ps.name}</h3>
                      <p className="text-sm text-gray-400 font-medium">{ps.type}</p>
                    </div>
                  </div>

                  {/* Edit & Delete – للكاشير والأدمن */}
                  {canManageDevices && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(ps)}
                        className="p-3 rounded-xl bg-gray-800 hover:bg-[#e2bc15] text-[#e2bc15] hover:text-black transition-all"
                        title="تعديل"
                      >
                        <FaEdit size={18} />
                      </button>
                      {!isOccupied && (
                        <button
                          onClick={() => handleDelete(ps)}
                          className="p-3 rounded-xl bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white transition-all"
                          title="حذف"
                        >
                          <FaTrash size={18} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6 p-4 bg-black/40 rounded-2xl border border-gray-800">
                  <p className="text-sm text-gray-400 mb-1">سعر الساعة</p>
                  <p className="text-3xl font-black text-[#e2bc15]">
                    {ps.pricePerHour} ج.م
                  </p>
                </div>

                {/* Status */}
                <div className="mb-6">
                  <span
                    className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold ${
                      isOccupied ? "bg-red-900/50 text-red-300 border border-red-700" : "bg-green-900/50 text-green-300 border border-green-700"
                    }`}
                  >
                    {isOccupied ? (
                      <>
                        <FaCircle className="text-red-500 animate-pulse" /> مشغول
                      </>
                    ) : (
                      <>
                        <FaCircle className="text-green-500" /> متاح
                      </>
                    )}
                  </span>
                </div>

                {/* Session Info */}
                {isOccupied && timer && (
                  <div className="mb-6 p-5 bg-black/60 rounded-2xl border border-red-900/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-gray-300">
                        <FaClock className="text-red-400" />
                        <span>المدة الحالية</span>
                      </div>
                      <p className="text-xl font-mono font-bold text-white">{timer.formatted}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-red-900/30">
                      <div className="flex items-center gap-2 text-gray-300">
                        <FaMoneyBillWave className="text-green-400" />
                        <span>المبلغ الحالي</span>
                      </div>
                      <p className="text-2xl font-black text-green-400">{timer.price} ج.م</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons – Start/End Session */}
                {canManageSessions ? (
                  isOccupied ? (
                    <button
                      onClick={() => handleEndSession(ps.currentSessionId?._id)}
                      disabled={endSessionMutation.isPending}
                      className="w-full py-4 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-bold rounded-2xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                    >
                      <FaStop /> إنهاء الجلسة
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartSession(ps._id)}
                      disabled={startSessionMutation.isPending}
                      className="w-full py-4 bg-gradient-to-r from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 text-white font-bold rounded-2xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                    >
                      <FaPlay /> بدء جلسة جديدة
                    </button>
                  )
                ) : (
                  <div className="text-center py-5 text-gray-500 font-medium border-t border-gray-700 mt-4">
                    غير مصرح لك بإدارة الجلسات
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && canManageDevices && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f1f1f] border border-[#e2bc15]/30 p-10 rounded-3xl w-full max-w-lg">
            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="absolute top-5 right-5 text-gray-400 hover:text-white text-3xl"
            >
              ×
            </button>

            <h2 className="text-3xl font-black text-[#e2bc15] mb-8">
              {isEditMode ? "تعديل الجهاز" : "إضافة جهاز جديد"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                placeholder="اسم الجهاز"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-4 bg-[#262626] border border-gray-700 rounded-xl text-white"
                required
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-4 bg-[#262626] border border-gray-700 rounded-xl text-white"
              >
                <option value="PS5">PS5</option>
                <option value="PS4">PS4</option>
              </select>
              <input
                type="number"
                placeholder="سعر الساعة"
                value={formData.pricePerHour}
                onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                className="w-full p-4 bg-[#262626] border border-gray-700 rounded-xl text-white"
                min="0"
                required
              />
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-[#e2bc15] text-black py-4 rounded-xl font-bold">
                  {isEditMode ? "حفظ التعديلات" : "إضافة"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-700 text-white py-4 rounded-xl">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && invoiceData && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f1f1f] border border-[#e2bc15]/30 p-10 rounded-3xl w-full max-w-lg">
            <button
              onClick={() => setShowInvoice(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white text-3xl"
            >
              ×
            </button>

            <h2 className="text-3xl font-black text-[#e2bc15] mb-8 text-center">فاتورة الجلسة</h2>

            <div className="space-y-6 text-center">
              <div className="p-6 bg-black/40 rounded-2xl border border-gray-800">
                <p className="text-gray-400 mb-2">الجهاز</p>
                <p className="text-2xl font-bold text-white">{invoiceData.playStation?.name || "غير معروف"}</p>
              </div>

              <div className="p-6 bg-black/40 rounded-2xl border border-gray-800">
                <p className="text-gray-400 mb-2">المدة</p>
                <p className="text-3xl font-bold text-[#e2bc15]">
                  {invoiceData.session?.durationMinutes || "--"} دقيقة
                </p>
              </div>

              <div className="p-6 bg-black/40 rounded-2xl border border-gray-800">
                <p className="text-gray-400 mb-2">المبلغ الإجمالي</p>
                <p className="text-4xl font-black text-green-400">
                  {invoiceData.session?.price || 0} ج.م
                </p>
              </div>

              <button
                onClick={() => setShowInvoice(false)}
                className="w-full mt-8 bg-[#e2bc15] hover:bg-white text-black font-black py-4 rounded-xl transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayStationDashboard;