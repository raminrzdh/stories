"use client";

import { useState } from "react";
import { Plus, Minus, Users, X } from "lucide-react";

interface PassengerPickerProps {
    adults: number;
    childrenCount: number;
    onChange: (adults: number, childrenCount: number) => void;
    onClose: () => void;
}

export default function PassengerPicker({ adults, childrenCount, onChange, onClose }: PassengerPickerProps) {
    return (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-gray-900">تعداد مسافران</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                    <X size={18} />
                </button>
            </div>

            <div className="space-y-6">
                {/* Adults */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-black text-gray-900">بزرگسال</p>
                        <p className="text-[10px] font-black text-gray-400">۱۲ سال به بالا</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onChange(Math.max(1, adults - 1), childrenCount)}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-red-600 hover:text-red-600 transition-all active:scale-90"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="text-lg font-black text-gray-900 w-4 text-center">{adults}</span>
                        <button
                            onClick={() => onChange(Math.min(10, adults + 1), childrenCount)}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-red-600 hover:text-red-600 transition-all active:scale-90"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-black text-gray-900">کودک</p>
                        <p className="text-[10px] font-black text-gray-400">۲ تا ۱۲ سال</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onChange(adults, Math.max(0, childrenCount - 1))}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-red-600 hover:text-red-600 transition-all active:scale-90"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="text-lg font-black text-gray-900 w-4 text-center">{childrenCount}</span>
                        <button
                            onClick={() => onChange(adults, Math.min(10, childrenCount + 1))}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-red-600 hover:text-red-600 transition-all active:scale-90"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <button
                onClick={onClose}
                className="w-full mt-8 bg-gray-900 text-white py-3 rounded-xl text-xs font-black shadow-lg shadow-gray-200 hover:bg-black transition-all active:scale-95"
            >
                تایید مسافران
            </button>
        </div>
    );
}
