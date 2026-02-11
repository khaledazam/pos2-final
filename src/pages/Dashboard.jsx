import { useEffect, useState } from "react";
import { MdTableBar, MdCategory } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";

import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";
import Modal from "../components/dashboard/Modal";
import InventoryModal from "../components/dashboard/InventoryModal";
import PlayStationDashboard from "./PlayStationDashboard";
import InventoryDashboard from "./InventoryDashboard";
import PaymentsList from "../components/dashboard/PaymentsList"; // ← تأكد إن الـ import ده صحيح حسب مسار الملف

const buttons = [
  { label: "Add Table", icon: <MdTableBar />, action: "table" },
  { label: "Add Category", icon: <MdCategory />, action: "item" },
  { label: "Add Items", icon: <BiSolidDish />, action: "item" },
];

const tabs = [
  { id: "Metrics", label: "Statistics" },
  { id: "Orders", label: "Orders" },
  { id: "PlayStation", label: "PlayStation" },
  { id: "Inventory", label: "Inventory" },
  { id: "Payments", label: "Payments" },
];

const Dashboard = () => {
  useEffect(() => { document.title = "Dashboard | POS System"; }, []);

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Metrics");

  // فتح المودال
  const handleOpenModal = (action) => {
    if (action === "table") setIsTableModalOpen(true);
    if (action === "item") setIsInventoryModalOpen(true);
  };

  return (
    <div className="bg-[#1a1a1a] min-h-[calc(100vh-5rem)]">
      {/* Controls */}
      <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between py-10 px-6 gap-8 border-b border-[#333]">
        <div className="flex items-center gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {buttons.map(({ label, icon, action }) => (
            <button
              key={label}
              onClick={() => handleOpenModal(action)}
              className="bg-[#262626] hover:bg-white hover:text-black px-8 py-4 rounded-2xl text-[#f5f5f5] font-black text-lg flex items-center gap-3 transition-all"
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-bold ${activeTab === tab.id ? "bg-white text-black" : "bg-[#262626] text-white"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-6 py-10">
        {activeTab === "Metrics" && <Metrics />}
        {activeTab === "Orders" && <RecentOrders />}
        {activeTab === "PlayStation" && <PlayStationDashboard />}
        {activeTab === "Inventory" && <InventoryDashboard />}
        {activeTab === "Payments" && <PaymentsList />}
      </div>

      {/* Modals */}
      {isTableModalOpen && <Modal setIsTableModalOpen={setIsTableModalOpen} />}
      <InventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;