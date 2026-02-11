import React, { useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { FaPrint } from "react-icons/fa";

/* ================= RECEIPT ================= */
const Receipt = React.forwardRef(({ orderInfo }, ref) => {
  if (!orderInfo) return null;

  const date = new Date(orderInfo.createdAt);

  return (
    <div
      ref={ref}
      style={{
        width: "80mm",
        padding: "8px",
        direction: "rtl",
        fontFamily: "Courier New, monospace",
        fontSize: "12px",
        color: "#000",
      }}
    >
      <style>
        {`
          @page { size: 80mm auto; margin: 0; }
          body { margin: 0; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; }
        `}
      </style>

      {/* ===== HEADER ===== */}
      <div className="center">
        <div className="bold" style={{ fontSize: "16px" }}>CAFE POS</div>
        <div>مطعم & كافيه</div>
        <div>القاهرة - مصر</div>
        <div>--------------------</div>
      </div>

      {/* ===== INFO ===== */}
      <div className="row">
        <span>تاريخ:</span>
        <span>{date.toLocaleDateString("ar-EG")}</span>
      </div>

      <div className="row">
        <span>وقت:</span>
        <span>{date.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span>
      </div>

      <div className="row">
        <span>فاتورة:</span>
        <span>#{orderInfo.orderCode || orderInfo._id.slice(-6)}</span>
      </div>

      {orderInfo.table && (
        <div className="row">
          <span>طاولة:</span>
          <span>{orderInfo.table.tableNo || orderInfo.table.name}</span>
        </div>
      )}

      <div className="row">
        <span>العميل:</span>
        <span>{orderInfo.customerDetails?.name || "ضيف"}</span>
      </div>

      <div className="line" />

      {/* ===== ITEMS HEADER ===== */}
      <div className="row bold">
        <span style={{ flex: 1 }}>الصنف</span>
        <span style={{ width: 30, textAlign: "center" }}>م</span>
        <span style={{ width: 60, textAlign: "left" }}>السعر</span>
      </div>

      {/* ===== ITEMS ===== */}
      {orderInfo.items.map((i, index) => (
        <div key={index} className="row">
          <span style={{ flex: 1 }}>{i.item?.name}</span>
          <span style={{ width: 30, textAlign: "center" }}>{i.quantity}</span>
          <span style={{ width: 60, textAlign: "left" }}>
            {(i.quantity * i.unitPrice).toFixed(2)}
          </span>
        </div>
      ))}

      <div className="line" />

      {/* ===== TOTALS ===== */}
      <div className="row">
        <span>المجموع:</span>
        <span>{orderInfo.bills?.subtotal?.toFixed(2) || "0.00"}</span>
      </div>

      {orderInfo.bills?.tax > 0 && (
        <div className="row">
          <span>ضريبة:</span>
          <span>{orderInfo.bills.tax.toFixed(2)}</span>
        </div>
      )}

      <div className="row bold" style={{ fontSize: "14px" }}>
        <span>الإجمالي:</span>
        <span>{orderInfo.bills?.total?.toFixed(2) || "0.00"} ج.م</span>
      </div>

      <div className="line" />

      {/* ===== FOOTER ===== */}
      <div className="center">
        <div className="bold">شكراً لزيارتكم ❤️</div>
        <div>سعدنا بخدمتكم</div>
      </div>
    </div>
  );
});

/* ================= THERMAL PRINTER ================= */
const ThermalPrinter = ({ orderInfo, autoprint }) => {
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice-${orderInfo?.orderCode || "POS"}`,
  });

  useEffect(() => {
    if (autoprint && orderInfo) {
      handlePrint();
    }
  }, [autoprint, orderInfo, handlePrint]);

  return (
    <>
      {/* Hidden printable content */}
      <div style={{ display: "none" }}>
        <Receipt ref={printRef} orderInfo={orderInfo} />
      </div>

      {/* Print Button */}
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        <FaPrint />
        طباعة حرارية
      </button>
    </>
  );
};

export default ThermalPrinter;
