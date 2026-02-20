"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, MapPin, Star, Share2, Heart, Wifi, Coffee, Car, Utensils, Info, ShieldCheck, ChevronLeft } from "lucide-react";
import { apiRequest } from "@/lib/api";
import StoryViewer from "@/components/story-viewer";

// Mock Data for a single hotel
const MOCK_HOTEL_DETAILS = {
    name: "هتل اسپیناس پالاس",
    stars: 5,
    rating: 4.8,
    reviews: 2450,
    price: "۸,۵۰۰,۰۰۰",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
    location: "تهران، سعادت آباد، میدان بهرود",
    description: "هتل اسپیناس پالاس تهران، نگینی در شمال پایتخت، با معماری خیره‌کننده و خدمات لوکس، تجربه‌ای فراموش‌نشدنی از اقامت را برای شما رقم می‌زند. این هتل ۵ ستاره با چشم‌اندازی پانوراما از شهر تهران، رستوران‌های بین‌المللی و امکانات رفاهی کامل، انتخابی ایده‌آل برای مسافران تجاری و تفریحی است.",
    amenities: [
        { icon: Wifi, label: "اینترنت پرسرعت" },
        { icon: Coffee, label: "کافی‌شاپ" },
        { icon: Utensils, label: "رستوران" },
        { icon: Car, label: "پارکینگ اختصاصی" },
    ]
};

export default function HotelDetails() {
    const { city_slug, hotel_slug } = useParams();
    const searchParams = useSearchParams();
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    const [stories, setStories] = useState<any[]>([]);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const data = await apiRequest(`/public/stories/${city_slug}`);
                setStories(data || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStories();
    }, [city_slug]);

    const nights = searchParams.get("nights");
    const decodedHotelName = decodeURIComponent(hotel_slug as string).replace(/-/g, " ");

    return (
        <div className="min-h-screen bg-white pb-32 font-sans">
            {/* Header / Navigation */}
            <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-6">
                    <Link href={`/رزرو-هتل/${city_slug}${dateFrom && dateTo ? `?date_from=${dateFrom}&date_to=${dateTo}${nights ? `&nights=${nights}` : ""}` : ""}`} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-600 transition-all border border-gray-100">
                        <ArrowRight size={20} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 tracking-tight">{decodedHotelName}</h1>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <MapPin size={10} className="text-red-600" />
                            {decodeURIComponent(city_slug as string)}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-600 border border-gray-100 transition-all">
                        <Share2 size={18} />
                    </button>
                    <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-600 border border-gray-100 transition-all">
                        <Heart size={18} />
                    </button>
                </div>
            </header>

            {/* Premium Stories Layer */}
            {stories.length > 0 && (
                <section className="bg-gray-50/50 py-6 border-b border-gray-100 shadow-inner">
                    <div className="container mx-auto px-6 flex gap-6 overflow-x-auto no-scrollbar">
                        {stories.map((group, index) => (
                            <div
                                key={group.id}
                                className="flex flex-col items-center gap-3 cursor-pointer group shrink-0"
                                onClick={() => setSelectedStoryIndex(index)}
                            >
                                <div className="p-1 rounded-full border-2 border-red-600 shadow-lg shadow-red-50 group-hover:scale-105 transition-all">
                                    <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden relative">
                                        {group.cover_url ? (
                                            <img
                                                src={group.cover_url.startsWith('http') ? group.cover_url : `http://localhost:8080${group.cover_url}`}
                                                alt={group.title_fa}
                                                className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all"
                                            />
                                        ) : (group.slides[0]?.thumbnail_url || group.slides[0]?.image_url) ? (
                                            <img
                                                src={`http://localhost:8080${group.slides[0]?.thumbnail_url || group.slides[0]?.image_url}`}
                                                alt={group.title_fa}
                                                className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 italic text-[8px]">No Cover</div>
                                        )}
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-colors group-hover:text-red-600">
                                    {group.caption || group.title_fa}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <main className="container mx-auto px-6 py-10 max-w-6xl">
                {/* Hero Layout */}
                <div className="grid lg:grid-cols-12 gap-10">
                    {/* Left: Content */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Gallery Mock */}
                        <div className="relative aspect-video rounded-[48px] overflow-hidden shadow-2xl shadow-gray-200 border-8 border-white group">
                            <img
                                src={MOCK_HOTEL_DETAILS.image}
                                alt={MOCK_HOTEL_DETAILS.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-transparent p-8">
                                <div className="flex gap-2">
                                    <span className="bg-red-600 text-white px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Premium Choice</span>
                                    <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Luxury Stay</span>
                                </div>
                            </div>
                        </div>

                        {/* Info Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-100">
                            <div>
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">{MOCK_HOTEL_DETAILS.name}</h1>
                                <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} className={i < MOCK_HOTEL_DETAILS.stars ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-100"} />
                                        ))}
                                    </div>
                                    <span className="text-gray-300">|</span>
                                    <div className="flex items-center gap-1 text-red-600">
                                        <MapPin size={16} />
                                        {MOCK_HOTEL_DETAILS.location}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-[32px] border border-gray-100">
                                <div className="text-left">
                                    <div className="text-3xl font-black text-gray-900 leading-none">{MOCK_HOTEL_DETAILS.rating}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Excellent Style</div>
                                </div>
                                <div className="w-px h-8 bg-gray-200" />
                                <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl">
                                    {MOCK_HOTEL_DETAILS.reviews} رضایت عمومی
                                </div>
                            </div>
                        </div>

                        {/* Amenities Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {MOCK_HOTEL_DETAILS.amenities.map((item, i) => (
                                <div key={i} className="flex flex-col gap-3 p-6 bg-white border border-gray-100 rounded-3xl hover:border-red-100 hover:shadow-lg transition-all group">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                        <item.icon size={24} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-900 uppercase tracking-widest leading-relaxed">{item.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-gray-900 border-r-4 border-red-600 pr-4">درباره این اقامتگاه</h3>
                            <p className="text-gray-500 leading-8 text-lg font-medium text-justify">
                                {MOCK_HOTEL_DETAILS.description}
                            </p>
                        </div>
                    </div>

                    {/* Right: Sticky Booking Card */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-32 bg-white rounded-[48px] border border-gray-100 p-8 shadow-2xl shadow-gray-100 space-y-8">
                            <div className="flex justify-between items-center bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                                <div className="text-left">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Starting Price</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-gray-900">{MOCK_HOTEL_DETAILS.price}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Per Night</span>
                                    </div>
                                </div>
                                <div className="bg-red-100 text-red-600 text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase">Best Price</div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm font-bold text-green-600 bg-green-50/50 p-4 rounded-2xl border border-green-100/50">
                                    <ShieldCheck size={20} />
                                    تضمین کمترین قیمت بازار
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-blue-600 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                                    <Info size={20} />
                                    کنسلی رایگان تا ۴۸ ساعت قبل
                                </div>
                            </div>

                            <button className="w-full bg-gray-900 hover:bg-black text-white h-16 rounded-[32px] font-black shadow-xl shadow-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group">
                                انتخاب و رزرو آنلاین
                                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </button>

                            <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">Security verified by Trip Protocol</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Story Viewer Overlay */}
            {selectedStoryIndex !== null && (
                <StoryViewer
                    groups={stories}
                    initialGroupIndex={selectedStoryIndex}
                    onClose={() => setSelectedStoryIndex(null)}
                />
            )}
        </div>
    );
}
