import React, { useState, useEffect } from "react";
import { FaEdit, FaPlus, FaExclamationTriangle, FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from "../https";
import ConfirmationModal from "../components/shared/ConfirmationModal";
import { formatCurrency } from "../utils/index";
import { useSnackbar } from "notistack";

import InventoryModal from "../components/dashboard/InventoryModal";

const InventoryDashboard = () => {
    const { enqueueSnackbar } = useSnackbar();

    // تصحيح استخراج الـ user
    const reduxUser = useSelector((state) => state.user);
    const currentUser = reduxUser?.user || {};           // ← المستوى الصحيح
    const isAdmin = currentUser.role?.toLowerCase() === "admin";

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // console.log("reduxUser:", reduxUser);
    // console.log("currentUser:", currentUser);
    // console.log("isAdmin:", isAdmin);
    // console.log("currentUser.role:", currentUser.role);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await getInventory();
            if (response.data.success) {
                setItems(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching inventory:", error);
            enqueueSnackbar("Failed to load inventory data", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const openAddModal = () => {
        setIsEditMode(false);
        setCurrentItem(null);
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setCurrentItem(item);
        setIsEditMode(true);
        setShowModal(true);
    };

    const handleQuantityChange = async (itemId, change) => {
        const item = items.find((i) => i._id === itemId);
        if (!item) return;

        const newQuantity = Number(item.quantity) + change;

        if (newQuantity < 0) {
            enqueueSnackbar("Cannot reduce quantity below 0", { variant: "warning" });
            return;
        }

        try {
            // Optimistic update
            setItems((prevItems) =>
                prevItems.map((i) =>
                    i._id === itemId
                        ? {
                              ...i,
                              quantity: newQuantity,
                              warning: newQuantity <= i.threshold,
                          }
                        : i
                )
            );

            await updateInventoryItem({
                id: itemId,
                quantity: newQuantity,
            });

            enqueueSnackbar(`Quantity updated to ${newQuantity}`, { variant: "success" });
        } catch (error) {
            console.error("Failed to update quantity:", error);
            enqueueSnackbar("Failed to update quantity", { variant: "error" });

            // Revert optimistic update on error
            setItems((prevItems) =>
                prevItems.map((i) =>
                    i._id === itemId
                        ? {
                              ...i,
                              quantity: item.quantity,
                              warning: item.quantity <= item.threshold,
                          }
                        : i
                )
            );
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteInventoryItem(deleteId);
            enqueueSnackbar("Item deleted successfully", { variant: "success" });
            fetchInventory();
        } catch (error) {
            enqueueSnackbar("Failed to delete item", { variant: "error" });
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="p-8 bg-[#1a1a1a] min-h-screen text-[#f5f5f5] w-full text-left">
            <div className="flex justify-between items-center mb-10 border-b border-[#333] pb-6">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-4">
                        <span className="bg-[#e2bc15] text-black p-3 rounded-2xl">
                            <FaPlus size={24} />
                        </span>{" "}
                        Inventory & Warehouse
                    </h1>
                    <p className="text-[#ababab] mt-2 text-lg font-bold">
                        Manage products, quantities, and prices
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-[#e2bc15] text-black px-8 py-4 rounded-2xl font-black hover:bg-white transition-all transform hover:scale-105 shadow-xl shadow-yellow-500/10 text-xl"
                    >
                        <FaPlus /> Add New Item
                    </button>
                )}
            </div>

            {/* باقي الكود كما هو بدون تغيير */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#e2bc15]"></div>
                    <p className="text-[#e2bc15] font-black text-xl animate-pulse">
                        Loading Inventory...
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden bg-[#1f1f1f] rounded-[2rem] shadow-2xl border border-[#333]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#262626] text-[#ababab] border-b border-[#333]">
                                <th className="p-6 text-xl font-black">Item</th>
                                <th className="p-6 text-xl font-black">Category</th>
                                <th className="p-6 text-xl font-black">Price</th>
                                <th className="p-6 text-xl font-black">Quantity</th>
                                <th className="p-6 text-xl font-black">Status</th>
                                {isAdmin && <th className="p-6 text-xl font-black text-center">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#333]">
                            {items.length > 0 ? (
                                items.map((item) => (
                                    <tr
                                        key={item._id}
                                        className={`hover:bg-[#2a2a2a] transition-all duration-300 ${
                                            item.warning ? "bg-red-900/10" : ""
                                        }`}
                                    >
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-xl font-black text-[#f5f5f5]">
                                                    {item.name}
                                                </span>
                                                <span className="text-sm text-[#555] font-bold">
                                                    ID: {item._id.slice(-6).toUpperCase()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="bg-[#333] px-4 py-1 rounded-full text-sm font-black text-[#ababab]">
                                                {item.category || "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className="p-6 font-black text-2xl text-[#e2bc15]">
                                            {formatCurrency(Number(item.price))}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleQuantityChange(item._id, -1)}
                                                        disabled={item.quantity <= 0}
                                                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-lg font-black transition-all ${
                                                            item.quantity <= 0
                                                                ? "bg-[#262626] text-gray-600 cursor-not-allowed"
                                                                : "bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white"
                                                        }`}
                                                        title="Decrease quantity"
                                                    >
                                                        −
                                                    </button>
                                                )}

                                                <div className="text-center min-w-[80px]">
                                                    <span className="text-2xl font-black text-[#f5f5f5] tabular-nums">
                                                        {item.quantity}
                                                    </span>
                                                    <span className="text-sm text-[#ababab] font-bold block">
                                                        {item.unit}
                                                    </span>
                                                </div>

                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleQuantityChange(item._id, +1)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-900/30 text-green-400 text-lg font-black hover:bg-green-600 hover:text-white transition-all"
                                                        title="Increase quantity"
                                                    >
                                                        +
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            {item.warning ? (
                                                <span className="flex items-center gap-2 text-white font-black bg-red-600 px-4 py-2 rounded-2xl text-sm shadow-lg shadow-red-600/20 w-fit">
                                                    <FaExclamationTriangle /> Low Stock
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 text-green-400 font-black bg-green-900/20 px-4 py-2 rounded-2xl text-sm w-fit border border-green-500/20">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                        {isAdmin && (
                                            <td className="p-6">
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="bg-[#262626] p-4 rounded-xl text-[#e2bc15] hover:bg-white hover:text-black transition-all shadow-lg"
                                                        title="Edit"
                                                    >
                                                        <FaEdit size={22} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteId(item._id)}
                                                        className="bg-[#262626] p-4 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                                        title="Delete"
                                                    >
                                                        <FaTrash size={22} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 5} className="p-20 text-center">
                                        <div className="opacity-30">
                                            <FaPlus className="mx-auto text-8xl mb-6" />
                                            <h3 className="text-2xl font-black">Inventory is empty</h3>
                                            <p className="text-lg">
                                                Start by adding new items to your products
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <InventoryModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                item={currentItem}
                isEditMode={isEditMode}
                onSuccess={fetchInventory}
            />

            {deleteId && (
                <ConfirmationModal
                    title="Delete Item"
                    message="Are you sure you want to delete this item permanently from inventory?"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteId(null)}
                    isDangerous={true}
                />
            )}
        </div>
    );
};

export default InventoryDashboard;