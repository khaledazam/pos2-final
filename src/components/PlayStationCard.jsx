import React, { useState, useEffect } from "react";
import { FaGamepad, FaClock, FaMoneyBillWave, FaPlay, FaStop } from "react-icons/fa";
import { formatCurrency } from "../utils/index";
import { useSnackbar } from "notistack";
import { startPSSession, endPSSession } from "../https";

const PlayStationCard = ({ ps, onSessionChange, user, onEdit, onDelete }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [currentPrice, setCurrentPrice] = useState(0);

  const isOccupied = ps.status === "occupied";
  const session = ps.currentSessionId;

  // Permission checks - simplified
  const userRole = user?.role?.toLowerCase() || "";
  const isAdmin = userRole === "admin";
  const canManageSessions = !!user && !!user._id; // Any logged-in user can manage sessions

  // Timer logic
  useEffect(() => {
    let interval;
    if (isOccupied && session && session.startTime) {
      const startTime = new Date(session.startTime).getTime();

      const updateTimer = () => {
        const now = new Date().getTime();
        const diffInSeconds = Math.floor((now - startTime) / 1000);
        setElapsedTime(diffInSeconds);

        const price = (diffInSeconds / 3600) * (session.pricePerHourSnapshot || ps.pricePerHour);
        setCurrentPrice(price.toFixed(2));
      };

      updateTimer(); // Initial call
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedTime(0);
      setCurrentPrice(0);
    }

    return () => clearInterval(interval);
  }, [isOccupied, session, ps.pricePerHour]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleStartSession = async () => {
    try {
      await startPSSession(ps._id);
      enqueueSnackbar("تم بدء السيشن بنجاح", { variant: "success" });
      onSessionChange();
    } catch (error) {
      enqueueSnackbar("خطأ في بدء السيشن: " + (error.response?.data?.message || error.message), { variant: "error" });
    }
  };

  const handleEndSession = async () => {
    try {
      const response = await endPSSession(session._id);
      const total = response.data.invoice?.finalInvoiceTotal || 0;
      enqueueSnackbar(`تم إنهاء السيشن بنجاح. الإجمالي: ${formatCurrency(total)}`, {
        variant: "success",
        autoHideDuration: 5000,
      });
      onSessionChange();
    } catch (error) {
      enqueueSnackbar("خطأ في إنهاء السيشن: " + (error.response?.data?.message || error.message), { variant: "error" });
    }
  };

  return (
    <div
      className={`relative p-8 rounded-[2rem] shadow-2xl border-2 transition-all duration-500 overflow-hidden group
        ${isOccupied
          ? "bg-[#2d1212] border-red-500/30"
          : "bg-[#1f1f1f] border-[#333] hover:border-[#e2bc15]/50"
        }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${isOccupied ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-[#e2bc15] text-black shadow-lg shadow-yellow-500/20'}`}>
            <FaGamepad size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#f5f5f5] mb-1">{ps.name}</h3>
            <span className="text-xs font-black tracking-widest text-[#ababab] bg-[#333] px-3 py-1 rounded-full uppercase">
              {ps.type}
            </span>
          </div>
        </div>

        {/* Edit & Delete – Admin only */}
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(ps)}
              className="text-[#e2bc15] hover:bg-[#e2bc15]/10 p-2 rounded-xl transition-all"
              title="تعديل السعر"
            >
              <FaEdit size={20} />
            </button>

            {!isOccupied && (
              <button
                onClick={() => onDelete(ps._id)}
                className="text-[#444] hover:text-red-500 transition-all p-2 hover:bg-red-500/10 rounded-xl"
                title="حذف الجهاز"
              >
                <FaTrash size={20} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center text-[#ababab] bg-[#1a1a1a] p-4 rounded-2xl border border-[#333]">
          <span className="text-lg font-bold">السعر للساعة</span>
          <span className="font-black text-2xl text-[#e2bc15]">{formatCurrency(ps.pricePerHour)}</span>
        </div>

        {isOccupied ? (
          <div className="bg-black/40 p-6 rounded-3xl space-y-4 border border-red-500/10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-[#ababab]">
                <FaClock className="text-red-500" /> <span className="font-bold text-lg">الوقت المنقضي</span>
              </div>
              <div className="font-black text-2xl text-[#f5f5f5] tabular-nums">
                {formatTime(elapsedTime)}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#333]">
              <div className="flex items-center gap-3 text-[#ababab]">
                <FaMoneyBillWave className="text-green-500" /> <span className="font-bold text-lg">التكلفة الحالية</span>
              </div>
              <div className="font-black text-3xl text-green-400 tabular-nums">
                {formatCurrency(currentPrice)}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 rounded-3xl bg-[#1a1a1a] border-2 border-dashed border-[#333] text-center">
            <p className="text-[#555] font-black text-xl">الجهاز متاح حاليًا</p>
          </div>
        )}

        <div className="space-y-3">
          {canManageSessions ? (
            <button
              onClick={isOccupied ? handleEndSession : handleStartSession}
              className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl
                ${isOccupied
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                  : "bg-[#e2bc15] hover:bg-white text-black shadow-yellow-500/10"
                }`}
            >
              {isOccupied ? (
                <>
                  <FaStop /> إنهاء السيشن
                </>
              ) : (
                <>
                  <FaPlay /> بدء سيشن جديد
                </>
              )}
            </button>
          ) : (
            <div className="text-center py-4 text-gray-500 font-medium">
              غير مصرح لك بإدارة هذا الجهاز
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayStationCard;