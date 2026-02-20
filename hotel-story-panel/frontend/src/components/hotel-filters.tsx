"use client";

import { Filter, Star, X } from "lucide-react";
import { useState } from "react";

export function HotelFilters() {
    const [price, setPrice] = useState(10000000);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 font-sans">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-red-600" /> فیلترها
                </h3>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                    حذف فیلترها
                </button>
            </div>

            {/* Price Filter */}
            <div className="mb-10 space-y-4">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">بازه قیمتی</label>
                    <div className="text-sm font-black text-gray-900">
                        تا {price.toLocaleString('fa-IR')} <span className="text-[10px] font-black text-gray-400">تومان</span>
                    </div>
                </div>
                <input
                    type="range"
                    min={0}
                    max={50000000}
                    step={100000}
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <div className="flex justify-between text-[10px] font-black text-gray-300">
                    <span>۰ تومان</span>
                    <span>۵۰ م تومان</span>
                </div>
            </div>

            <div className="h-px bg-gray-50 mb-8" />

            {/* Star Rating */}
            <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-4">درجه هتل</label>
                {[5, 4, 3, 2, 1].map(star => (
                    <label key={star} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded-md border-gray-200 text-red-600 focus:ring-red-100 transition-all cursor-pointer"
                            />
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        className={i < star ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200"}
                                    />
                                ))}
                            </div>
                        </div>
                        <span className="text-xs font-black text-gray-400 group-hover:text-gray-900 transition-colors">
                            {star === 5 ? 'عالی' : star === 4 ? 'خیلی خوب' : 'استاندارد'}
                        </span>
                    </label>
                ))}
            </div>

            <div className="mt-10">
                <button className="w-full bg-gray-900 text-white py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-gray-200 hover:bg-black transition-all active:scale-95">
                    اعمال فیلترها
                </button>
            </div>
        </div>
    );
}
