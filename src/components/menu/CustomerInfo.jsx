import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { formatDate, getAvatarName } from "../../utils";

const CustomerInfo = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const customer = useSelector((state) => state.customer);

  // Update time every minute (or every second if you prefer)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60_000); // 60000 ms = 1 minute

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  const customerName = customer.customerName || "زائر";
  const avatarInitials = getAvatarName(customerName) || "ZN";
  const orderNumber = customer.orderId || customer.orderNumber || "—"; // fallback

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] rounded-lg shadow-sm">
      {/* Left - Info */}
      <div className="flex flex-col items-start">
        <h2 className="text-base md:text-lg text-white font-semibold tracking-wide">
          {customerName}
        </h2>

        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <span className="font-medium">#{orderNumber}</span>
          <span className="text-gray-500">•</span>
          <span>تناول داخلي</span>
        </div>

        <p className="text-xs text-gray-400 mt-1.5">
          {formatDate(currentTime)}
        </p>
      </div>

      {/* Right - Avatar Button */}
      <button
        type="button"
        aria-label={`معلومات العميل: ${customerName}`}
        className="bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 
                   text-black font-bold text-xl w-12 h-12 md:w-14 md:h-14 
                   rounded-xl flex items-center justify-center 
                   transition-colors duration-200 shadow-md"
      >
        {avatarInitials}
      </button>
    </div>
  );
};

export default CustomerInfo;