import React from "react";

const ConfirmationModal = ({ title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", isDangerous = false }) => {
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-[#1f1f1f] rounded-2xl w-full max-w-md border border-[#333] shadow-2xl p-6 transform scale-100 animate-in zoom-in-95 duration-200">
                <h3 className={`text-2xl font-black mb-4 ${isDangerous ? "text-red-500" : "text-[#f5f5f5]"}`}>
                    {title}
                </h3>
                <p className="text-[#ababab] font-bold text-lg mb-8 leading-relaxed">
                    {message}
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 rounded-xl font-black text-lg transition-all ${isDangerous
                            ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20"
                            : "bg-[#e2bc15] text-black hover:bg-white"
                            }`}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 bg-[#333] text-white font-bold rounded-xl text-lg hover:bg-[#444] transition-all"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
