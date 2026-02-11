import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useSnackbar } from "notistack";
import { addInventoryItem, updateInventoryItem } from "../../https";

const InventoryModal = ({ isOpen, onClose, item = null, isEditMode = false, onSuccess }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: item?.name || "",
        quantity: item?.quantity || "",
        unit: item?.unit || "Piece",
        price: item?.price || "",
        category: item?.category || "",
        threshold: item?.threshold || 5,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        if (!formData.name.trim()) return "Product name is required";
        if (formData.quantity === "" || Number(formData.quantity) < 0) return "Quantity must be 0 or more";
        if (!formData.price || Number(formData.price) <= 0) return "Price must be greater than 0";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        const error = validateForm();
        if (error) {
            enqueueSnackbar(error, { variant: "warning" });
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                quantity: Number(formData.quantity),
                price: Number(formData.price),
                threshold: Number(formData.threshold),
            };

            if (isEditMode && item) {
                await updateInventoryItem({ id: item._id, ...payload });
                enqueueSnackbar("Item updated successfully", { variant: "success" });
            } else {
                await addInventoryItem(payload);
                enqueueSnackbar("Item added successfully", { variant: "success" });
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving item:", error);
            enqueueSnackbar("Failed to save data. Please check inputs.", { variant: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex justify-center items-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-[#1a1a1a] p-10 rounded-[3rem] w-full max-w-xl shadow-2xl border border-[#333]"
                    >
                        <div className="flex justify-between items-center mb-8 text-[#e2bc15] border-l-8 border-[#e2bc15] pl-4">
                            <h2 className="text-3xl font-black">
                                {isEditMode ? "Edit Item Details" : "Add New Item"}
                            </h2>
                            <button onClick={onClose} className="text-[#ababab] hover:text-white transition-colors">
                                <IoMdClose size={32} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="space-y-2">
                                <label className="text-lg font-bold text-[#ababab]">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Ex: Cola, Chips, Sandwich..."
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full p-5 bg-[#262626] border-2 border-[#333] rounded-2xl text-[#f5f5f5] text-xl font-bold focus:outline-none focus:border-[#e2bc15] transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-lg font-bold text-[#ababab]">Available Quantity</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        placeholder="0"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        className="w-full p-5 bg-[#262626] border-2 border-[#333] rounded-2xl text-[#f5f5f5] text-xl font-bold focus:outline-none focus:border-[#e2bc15] transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-lg font-bold text-[#ababab]">Unit of Measure</label>
                                    <input
                                        type="text"
                                        name="unit"
                                        placeholder="Ex: Piece, Bottle..."
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                        className="w-full p-5 bg-[#262626] border-2 border-[#333] rounded-2xl text-[#f5f5f5] text-xl font-bold focus:outline-none focus:border-[#e2bc15] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-lg font-bold text-[#ababab] text-[#e2bc15]">Unit Price (EGP)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="w-full p-5 bg-[#262626] border-2 border-[#333] rounded-2xl text-[#f5f5f5] text-xl font-bold focus:outline-none focus:border-[#e2bc15] transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-lg font-bold text-[#ababab]">Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        placeholder="Ex: Drinks, Food..."
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full p-5 bg-[#262626] border-2 border-[#333] rounded-2xl text-[#f5f5f5] text-xl font-bold focus:outline-none focus:border-[#e2bc15] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-lg font-bold text-[#ababab] text-red-400">Low Stock Alert at:</label>
                                <input
                                    type="number"
                                    name="threshold"
                                    placeholder="5"
                                    value={formData.threshold}
                                    onChange={handleInputChange}
                                    className="w-full p-5 bg-[#262626] border-2 border-[#333] rounded-2xl text-[#f5f5f5] text-xl font-bold focus:outline-none focus:border-red-500 transition-all shadow-inner shadow-red-500/5"
                                />
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`flex-1 py-5 bg-[#e2bc15] text-black font-black rounded-2xl text-2xl hover:bg-white transition-all shadow-xl shadow-yellow-500/10 
                                        ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {submitting ? "Saving..." : (isEditMode ? "Update Details" : "Add to Stock")}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-10 py-5 bg-[#333] text-white font-bold rounded-2xl text-2xl hover:bg-[#444] transition-all"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default InventoryModal;
