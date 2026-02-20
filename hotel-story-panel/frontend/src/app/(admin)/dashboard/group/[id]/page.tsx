"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Trash2, Pencil, Plus, LayoutGrid, Eye, Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";
import StoryBuilder from "@/components/story-builder";
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

export default function GroupDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [slides, setSlides] = useState<Slide[]>([]);
    const [groupTitle, setGroupTitle] = useState("");
    const [uploading, setUploading] = useState(false);
    const [showBuilder, setShowBuilder] = useState(false);
    const [editingSlide, setEditingSlide] = useState<Slide | null>(null);

    const fetchGroupData = async () => {
        try {
            const group = await apiRequest(`/admin/story-groups/${id}`);
            if (group) {
                setSlides(group.slides || []);
                setGroupTitle(group.title_fa);
            }
        } catch (err: any) {
            console.error(err);
            if (err.message.includes('401')) {
                localStorage.removeItem('token');
                router.push('/login');
            }
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchGroupData();
    }, [id]);

    const handleUpload = async (imageBlob: Blob | null, elements: any[], duration: number, backgroundColor: string | null) => {
        setUploading(true);
        const formData = new FormData();
        if (imageBlob) {
            formData.append('image', imageBlob, 'story.jpg');
        }
        formData.append('elements', JSON.stringify(elements));
        formData.append('duration', duration.toString());
        if (backgroundColor) {
            formData.append('background_color', backgroundColor);
        }
        try {
            const token = localStorage.getItem('token');
            const url = editingSlide
                ? `http://localhost:8080/api/admin/stories/${editingSlide.id}`
                : `http://localhost:8080/api/admin/story-groups/${id}/stories`;

            const res = await fetch(url, {
                method: editingSlide ? 'PUT' : 'POST',
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: formData,
            });
            if (res.ok) {
                setShowBuilder(false);
                setEditingSlide(null);
                fetchGroupData();
                alert(editingSlide ? 'اسلاید با موفقیت ویرایش شد' : 'اسلاید با موفقیت افزوده شد');
            } else {
                alert('خطا در آپلود');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteSlide = async (slideId: number) => {
        if (!confirm("آیا از حذف این اسلاید مطمئن هستید؟")) return;
        try {
            await apiRequest(`/admin/stories/${slideId}`, { method: "DELETE" });
            fetchGroupData();
        } catch (err: any) {
            if (err.message.includes('401')) {
                localStorage.removeItem('token');
                router.push('/login');
            } else {
                alert("خطا در حذف اسلاید");
            }
        }
    };

    const handleEditSlide = (slide: Slide) => {
        setEditingSlide(slide);
        setShowBuilder(true);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-600 hover:shadow-lg hover:shadow-red-50 transition-all border border-gray-100"
                        >
                            <ArrowRight size={24} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">مدیریت محتوا</span>
                                <span className="text-gray-300">/</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {id}</span>
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{groupTitle || 'در حال بارگذاری...'}</h1>
                        </div>
                    </div>

                    {!showBuilder && (
                        <button
                            onClick={() => {
                                setEditingSlide(null);
                                setShowBuilder(true);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-2xl font-black shadow-xl shadow-red-100 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Plus size={20} strokeWidth={3} />
                            افزودن اسلاید جدید
                        </button>
                    )}
                </div>

                {showBuilder ? (
                    <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                            <div>
                                <h2 className="text-xl font-black text-gray-900">{editingSlide ? 'ویرایش اسلاید' : 'طراحی اسلاید جدید'}</h2>
                                <p className="text-sm text-gray-500 font-medium">محتوای بصری و المان‌های تعاملی را اضافه کنید.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowBuilder(false);
                                    setEditingSlide(null);
                                }}
                                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="h-[750px] relative">
                            <StoryBuilder onUpload={handleUpload} initialData={editingSlide || undefined} />
                            {uploading && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-lg font-black text-gray-900">در حال آپلود و پردازش اسلاید...</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {slides.length === 0 ? (
                            <div className="col-span-full py-24 text-center">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                                    <LayoutGrid size={48} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">هنوز اسلایدی نساخته‌اید</h3>
                                <p className="text-gray-400 font-medium mb-8">اولین اسلاید را برای این گروه طراحی کنید.</p>
                                <button
                                    onClick={() => setShowBuilder(true)}
                                    className="bg-white border-2 border-dashed border-gray-200 hover:border-red-600 hover:text-red-600 text-gray-400 px-8 py-4 rounded-2xl font-black transition-all"
                                >
                                    شروع طراحی
                                </button>
                            </div>
                        ) : (
                            slides.map((slide, index) => (
                                <div key={slide.id} className="group relative">
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-black text-white rounded-xl flex items-center justify-center text-xs font-black z-10 shadow-lg group-hover:bg-red-600 transition-colors">
                                        {index + 1}
                                    </div>
                                    <div
                                        className="relative aspect-[9/16] rounded-[32px] overflow-hidden bg-gray-200 border-4 border-white shadow-xl shadow-gray-200/50 group-hover:shadow-red-200/60 transition-all group-hover:-translate-y-2 group-hover:scale-[1.02] bg-cover bg-center"
                                        style={slide.image_url ? { backgroundImage: `url(http://localhost:8080${slide.image_url})` } : { backgroundColor: slide.background_color || '#eee' }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-6 gap-3">
                                            <div className="flex gap-2 mb-4">
                                                <button
                                                    onClick={() => handleDeleteSlide(slide.id)}
                                                    className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-red-700 active:scale-95 transition-all"
                                                >
                                                    <Trash2 size={24} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditSlide(slide)}
                                                    className="w-12 h-12 bg-white text-gray-900 rounded-2xl flex items-center justify-center shadow-lg hover:bg-gray-100 active:scale-95 transition-all"
                                                >
                                                    <Pencil size={24} />
                                                </button>
                                            </div>
                                            <div className="w-full h-px bg-white/20 mb-2" />
                                            <div className="w-full flex justify-between items-center text-white/90">
                                                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-tighter">
                                                    <Eye size={14} className="text-red-400" />
                                                    {slide.open_count} بازدید
                                                </div>
                                                <div className="flex items-center gap-1.5 font-bold text-xs">
                                                    <Clock size={14} className="text-red-400" />
                                                    ۰۷:۰۰
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest line-clamp-1 group-hover:text-red-600 transition-colors">
                                        {slide.caption_fa || `Slide ${slide.id}`}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function X(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}
