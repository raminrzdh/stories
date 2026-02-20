"use client";

import React, { useEffect, useState } from "react";
import {
    Layers,
    Eye,
    Activity,
    Calendar,
    ChevronLeft,
    MapPin,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Stats {
    total_groups: number;
    active_groups: number;
    total_slides: number;
    total_views: number;
    total_cities: number;
}

export default function DashboardOverview() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }
                const res = await fetch('http://localhost:8080/api/admin/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/login');
                    return;
                }

                if (!res.ok) throw new Error("Failed to fetch statistics");

                const data = await res.json();
                setStats(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [router]);

    const statCards = [
        {
            title: "تعداد شهرها",
            value: stats?.total_cities || 0,
            icon: <MapPin size={24} />,
            color: "bg-indigo-600",
            lightColor: "bg-indigo-50",
            textColor: "text-indigo-600"
        },
        {
            title: "گروه‌های فعال",
            value: stats?.active_groups || 0,
            icon: <Activity size={24} />,
            color: "bg-emerald-600",
            lightColor: "bg-emerald-50",
            textColor: "text-emerald-600"
        },
        {
            title: "تعداد استوری‌ها",
            value: stats?.total_slides || 0,
            icon: <Layers size={24} />,
            color: "bg-purple-600",
            lightColor: "bg-purple-50",
            textColor: "text-purple-600"
        },
        {
            title: "مجموع بازدیدها",
            value: stats?.total_views || 0,
            icon: <Eye size={24} />,
            color: "bg-red-600",
            lightColor: "bg-red-50",
            textColor: "text-red-600"
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-medium text-slate-500">در حال دریافت آمار...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, idx) => (
                    <div
                        key={idx}
                        className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className={`p-4 rounded-2xl ${card.lightColor} ${card.textColor} group-hover:scale-110 transition-transform`}>
                                {card.icon}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full uppercase">
                                <ArrowUpRight size={10} />
                                Live
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">{card.title}</div>
                            <div className="text-3xl font-black text-slate-900 tracking-tight">{card.value.toLocaleString('fa-IR')}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Info */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900">گزارش‌های جدید</h3>
                            <p className="text-slate-400 text-sm font-medium mt-1">آخرین تغییرات و وضعیت‌های سیستم.</p>
                        </div>
                        <Link
                            href="/dashboard/groups"
                            className="text-slate-400 hover:text-red-600 text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors group"
                        >
                            مشاهده مدیریت استوری‌ها
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 border-dashed">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                <Calendar size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-slate-900">بروزرسانی داده‌ها</div>
                                <div className="text-xs text-slate-400 font-medium mt-0.5">تمامی آمارها مربوط به ۲۴ ساعت گذشته هستند.</div>
                            </div>
                            <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">Just Now</div>
                        </div>
                    </div>
                </div>

                {/* Quick Tips */}
                <div className="bg-red-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-red-200">
                    <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-white/10 rounded-full blur-[60px]" />
                    <div className="relative z-10 space-y-6">
                        <h3 className="text-xl font-black leading-tight">نکته حرفه‌ای:</h3>
                        <p className="text-red-100 font-medium text-sm leading-relaxed opacity-80">
                            استوری‌هایی که دارای کپشن‌های کوتاه و جذاب (کمتر از ۲۰ کاراکتر) هستند، تا ۴۰ درصد کلیک بیشتری دریافت می‌کنند.
                        </p>
                        <div className="pt-4 border-t border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold">؟</div>
                                <div className="text-xs font-medium text-white/90">می‌خواهید استوری‌ها را بهینه‌تر کنید؟</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
