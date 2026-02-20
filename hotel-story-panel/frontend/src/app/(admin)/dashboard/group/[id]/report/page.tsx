"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, MousePointerClick, Calendar, BarChart2, TrendingUp, Users, Clock, Download } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface Slide {
    id: number;
    image_url: string;
    thumbnail_url: string | null;
    caption_fa: string;
    sort_order: number;
    open_count: number;
    background_color?: string;
}

interface GroupDetails {
    id: number;
    city_slug: string;
    title_fa: string;
    active: boolean;
    view_count: number;
    created_at: string;
    slides: Slide[];
}

export default function AnalyticsReport() {
    const { id } = useParams();
    const router = useRouter();
    const [group, setGroup] = useState<GroupDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroupDetails = async () => {
            try {
                const data = await apiRequest(`/admin/story-groups/${id}`);
                setGroup(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGroupDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-bold">در حال تحلیل داده‌ها...</p>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="p-20 text-center">
                <h1 className="text-2xl font-black text-red-600">گروه یافت نشد</h1>
                <Link href="/dashboard" className="text-blue-600 underline mt-4 inline-block font-bold">بازگشت به داشبورد</Link>
            </div>
        );
    }

    const totalOpens = group.slides?.reduce((acc, slide) => acc + slide.open_count, 0) || 0;
    const engagementRate = group.view_count > 0 ? ((totalOpens / group.view_count) * 100).toFixed(1) : 0;

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-600 hover:shadow-lg border border-gray-100 transition-all font-bold"
                        >
                            <ArrowRight size={24} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">گزارش تحلیلی</span>
                                <span className="text-gray-300">/</span>
                                <h2 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{group.title_fa}</h2>
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">تحلیل عملکرد استوری</h1>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-xl text-sm font-black text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                        <Download size={18} />
                        خروجی PDF
                    </button>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: "بازدید کل لیست", value: group.view_count, sub: "نمایش در نتایج جستجو", icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "مجموع باز شدن‌ها", value: totalOpens, sub: "تعامل مستقیم با اسلاید‌", icon: MousePointerClick, color: "text-red-600", bg: "bg-red-50" },
                        { label: "نرخ تعامل", value: `٪${engagementRate}`, sub: "نسبت کلیک به نمایش", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
                        { label: "میانگین زمان", value: "۴.۲ ثانیه", sub: "مدت ماندگاری در استوری", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
                    ].map((stat, i) => (stat &&
                        <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                                    <stat.icon size={24} />
                                </div>
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Live Now</span>
                            </div>
                            <div className="text-3xl font-black text-gray-900 mb-1">{stat.value.toLocaleString('fa-IR')}</div>
                            <div className="text-sm font-black text-gray-400">{stat.label}</div>
                            <div className="mt-4 pt-4 border-t border-gray-50 text-[10px] font-bold text-gray-400 italic">
                                {stat.sub}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Detailed Table */}
                <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">آمار به تفکیک اسلاید</h3>
                            <p className="text-sm text-gray-500 font-medium">بررسی عملکرد هر قطعه محتوا به صورت انفرادی</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 flex items-center gap-2">
                                <Calendar size={14} />
                                ۳۰ روز اخیر
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">پیش‌نمایش</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">عنوان / کپشن</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">تعداد Open</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">سهم از کل تعامل</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">وضعیت</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {group.slides?.map((slide, idx) => (
                                    <tr key={slide.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-4">
                                            <div
                                                className="w-14 aspect-[9/16] rounded-xl border-2 border-white shadow-md bg-gray-200 bg-cover bg-center overflow-hidden transition-transform group-hover:scale-110"
                                                style={slide.image_url ? { backgroundImage: `url(http://localhost:8080${slide.image_url})` } : { backgroundColor: slide.background_color || '#eee' }}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-black text-gray-900">{slide.caption_fa || `اسلاید شماره ${idx + 1}`}</div>
                                            <div className="text-[10px] text-gray-400 font-bold font-mono mt-1">ID: SLD-{slide.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                                <span className="text-lg font-black text-gray-900">{slide.open_count.toLocaleString('fa-IR')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-32">
                                                <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                                                    <span>{((slide.open_count / totalOpens) * 100 || 0).toFixed(0)}٪</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-red-600 rounded-full"
                                                        style={{ width: `${(slide.open_count / totalOpens) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-left">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black">
                                                <div className="w-1 h-1 rounded-full bg-green-600" />
                                                فعال
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!group.slides || group.slides.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="text-gray-300 font-bold">داده‌ای برای نمایش وجود ندارد</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
