"use client";

import { Filter, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function HotelFilters() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> فیلترها
                </h3>
                <button className="text-xs text-blue-600 hover:underline">حذف فیلترها</button>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">بازه قیمتی (هر شب)</label>
                <div className="h-2 bg-gray-200 rounded-full mt-2 relative">
                    <div className="absolute left-0 right-1/3 top-0 bottom-0 bg-red-600 rounded-full"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>۰ تومان</span>
                    <span>۵۰ م تومان</span>
                </div>
            </div>

            <hr className="my-4" />

            {/* Star Rating */}
            <div className="space-y-2">
                <label className="text-sm font-medium block">تعداد ستاره</label>
                {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox id={`star-${star}`} />
                        <Label htmlFor={`star-${star}`} className="text-sm flex items-center gap-1 cursor-pointer">
                            {star} ستاره
                            <div className="flex">
                                {[...Array(star)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                            </div>
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
}
