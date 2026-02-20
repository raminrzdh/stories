"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import StoryViewer from "@/components/story-viewer";
import { apiRequest } from "@/lib/api";
import { MapPin, Star, Filter, SlidersHorizontal, ArrowRight, Search, ChevronDown, Heart, Calendar as CalendarIcon, Users } from "lucide-react";
import Link from "next/link";
import { HotelFilters } from "@/components/hotel-filters";
import { Calendar } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import PassengerPicker from "@/components/passenger-picker";

// Mock Data for Hotels
const MOCK_HOTELS = [
    {
        id: 1,
        name: "هتل اسپیناس پالاس",
        stars: 5,
        rating: 4.8,
        reviews: 2450,
        price: "۸,۵۰۰,۰۰۰",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
        location: "تهران، سعادت آباد"
    },
    {
        id: 2,
        name: "هتل استقلال",
        stars: 4,
        rating: 4.2,
        reviews: 1200,
        price: "۴,۲۰۰,۰۰۰",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop",
        location: "تهران، خیابان ولیعصر"
    },
    {
        id: 21,
        name: "هتل آزادی",
        stars: 5,
        rating: 4.6,
        reviews: 1800,
        price: "۷,۱۰۰,۰۰۰",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop",
        location: "تهران، بزرگراه چمران"
    },
    {
        id: 3,
        name: "هاستل شیراز",
        stars: 2,
        rating: 4.5,
        reviews: 850,
        price: "۸۵۰,۰۰۰",
        image: "https://images.unsplash.com/photo-1555854743-e3c2f6a53995?q=80&w=2070&auto=format&fit=crop",
        location: "شیراز، خیابان زند"
    },
    {
        id: 9,
        name: "هتل داریوش",
        stars: 5,
        rating: 4.7,
        reviews: 3800,
        price: "۱۰,۵۰۰,۰۰۰",
        image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop",
        location: "کیش، میدان داریوش"
    },
];

export default function SearchResults() {
    const { city_slug } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const nightsParam = searchParams.get("nights");

    const [stories, setStories] = useState<any[]>([]);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Editable Search State
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [destination, setDestination] = useState(decodeURIComponent(city_slug as string));
    const [dateRange, setDateRange] = useState<any>(null);
    const [adults, setAdults] = useState(1);
    const [childrenCount, setChildrenCount] = useState(0);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showPassengerPicker, setShowPassengerPicker] = useState(false);

    const datePickerRef = useRef<HTMLDivElement>(null);
    const passengerPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
            if (passengerPickerRef.current && !passengerPickerRef.current.contains(event.target as Node)) {
                setShowPassengerPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleUpdateSearch = (forcedNights?: number) => {
        const normalizedInput = destination.trim();
        const apiSlug = normalizedInput || "tehran";

        let dateParams = "";
        if (dateRange && Array.isArray(dateRange) && dateRange.length >= 2) {
            const start = dateRange[0].toDate();
            const end = dateRange[1].toDate();

            const format = (date: Date) => {
                const d = new Date(date);
                let month = '' + (d.getMonth() + 1);
                let day = '' + d.getDate();
                const year = d.getFullYear();

                if (month.length < 2) month = '0' + month;
                if (day.length < 2) day = '0' + day;
                return [year, month, day].join('-');
            };

            let n = forcedNights;
            if (n === undefined) {
                const diffTime = Math.abs(end.getTime() - start.getTime());
                n = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            dateParams = `?date_from=${format(start)}&date_to=${format(end)}&nights=${n}`;
        }

        setIsSearchExpanded(false);
        router.push(`/رزرو-هتل/${apiSlug}${dateParams}`);
    };

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const decodedCity = decodeURIComponent(city_slug as string).trim();
                // We now use the Persian slug directly as defined in the dashboard
                const data = await apiRequest(`/public/stories/${decodedCity}`);
                setStories(data || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStories();
    }, [city_slug]);

    const decodedSlug = decodeURIComponent(city_slug as string).trim();

    // Map Persian slugs back to English for API compatibility
    const persianToEnglishMap: Record<string, string> = {
        "تهران": "tehran", "شیراز": "shiraz", "مشهد": "mashhad", "اصفهان": "isfahan",
        "کیش": "kish", "تبریز": "tabriz", "یزد": "yazd", "قشم": "qeshm", "قم": "qom"
    };

    const apiSlug = persianToEnglishMap[decodedSlug] || decodedSlug;
    const searchTerm = decodedSlug; // Search in mock hotels by Persian name
    const filteredHotels = MOCK_HOTELS.filter(h => h.location.toLowerCase().includes(searchTerm));

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Navigation Header */}
            <header className="bg-white sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-gray-100 backdrop-blur-md bg-white/90">
                <div className="flex items-center gap-6">
                    <Link href="/" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-600 transition-all border border-gray-100">
                        <ArrowRight size={20} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black">H</div>
                        <span className="text-xl font-black tracking-tight">Trip</span>
                    </div>
                </div>

                <div
                    onClick={() => setIsSearchExpanded(true)}
                    className={`hidden md:flex items-center bg-gray-100 rounded-2xl px-5 py-2.5 gap-4 border border-transparent hover:border-red-100 hover:bg-white transition-all cursor-pointer group ${isSearchExpanded ? 'opacity-0 pointer-events-none' : ''}`}
                >
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-red-600" />
                        <span className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors uppercase">{decodeURIComponent(city_slug as string)}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300" />
                    <div className="text-xs font-medium text-gray-500">
                        {dateFrom && dateTo ? `${dateFrom} تا ${dateTo}${nightsParam ? ` • ${nightsParam} شب` : ""}` : "رزرو هتل • ۳ شب"}
                    </div>
                    <ChevronDown size={14} className="text-gray-300" />
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors">
                        <Search size={22} />
                    </button>
                    <button className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-100 active:scale-95 transition-all">
                        ورود یا ثبت‌نام
                    </button>
                </div>

                {/* Expanded Search Overlay */}
                {isSearchExpanded && (
                    <div className="absolute top-0 left-0 w-full bg-white shadow-2xl z-50 animate-in slide-in-from-top duration-300 pb-12 pt-6 px-6">
                        <div className="container mx-auto max-w-5xl">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-gray-900">جستجوی جدید</h2>
                                <button
                                    onClick={() => setIsSearchExpanded(false)}
                                    className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <ArrowRight size={20} className="rotate-180" />
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row items-stretch gap-2 bg-gray-50 p-2 rounded-[2.5rem] border border-gray-100">
                                <div className="flex-1 min-w-[240px] relative">
                                    <div className="absolute top-1/2 -translate-y-1/2 right-6 text-gray-400">
                                        <MapPin size={22} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="نام شهر یا هتل"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className="w-full h-16 pr-16 pl-6 bg-white border border-transparent rounded-[2rem] focus:ring-4 focus:ring-red-50 focus:border-red-600 outline-none transition-all text-gray-900 placeholder:text-gray-400 font-bold shadow-sm"
                                    />
                                </div>

                                <div className="flex-1 min-w-[220px] relative" ref={datePickerRef}>
                                    <div className="absolute top-1/2 -translate-y-1/2 right-6 text-gray-400">
                                        <CalendarIcon size={22} />
                                    </div>
                                    <div
                                        onClick={() => setShowDatePicker(!showDatePicker)}
                                        className="w-full h-16 pr-16 pl-6 flex items-center justify-between bg-white border border-transparent rounded-[2rem] cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
                                    >
                                        <span className={`font-black tracking-tight ${dateRange ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {dateRange && dateRange[0] ? (
                                                dateRange[1] ? `${dateRange[0].format("D MMMM")} - ${dateRange[1].format("D MMMM")}`
                                                    : dateRange[0].format("D MMMM")
                                            ) : "تاریخ سفر"}
                                        </span>
                                    </div>

                                    {showDatePicker && (
                                        <div className="absolute top-full left-0 md:right-0 md:left-auto mt-4 bg-white rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] border border-gray-100 p-6 z-50 animate-in fade-in zoom-in duration-200 min-w-[340px]">
                                            <Calendar
                                                range
                                                value={dateRange}
                                                onChange={setDateRange}
                                                calendar={persian}
                                                locale={persian_fa}
                                                className="shamsi-calendar-custom"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-[200px] relative" ref={passengerPickerRef}>
                                    <div className="absolute top-1/2 -translate-y-1/2 right-6 text-gray-400">
                                        <Users size={22} />
                                    </div>
                                    <div
                                        onClick={() => setShowPassengerPicker(!showPassengerPicker)}
                                        className="w-full h-16 pr-16 pl-6 flex items-center justify-between bg-white border border-transparent rounded-[2rem] cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
                                    >
                                        <span className="text-gray-900 font-black tracking-tight">
                                            {adults + childrenCount} مسافر
                                        </span>
                                    </div>

                                    {showPassengerPicker && (
                                        <PassengerPicker
                                            adults={adults}
                                            childrenCount={childrenCount}
                                            onChange={(a, c) => {
                                                setAdults(a);
                                                setChildrenCount(c);
                                            }}
                                            onClose={() => setShowPassengerPicker(false)}
                                        />
                                    )}
                                </div>

                                <button
                                    onClick={() => handleUpdateSearch()}
                                    className="bg-red-600 hover:bg-red-700 text-white px-10 rounded-[2rem] h-16 text-sm font-bold shadow-xl shadow-red-200 transition-all active:scale-95"
                                >
                                    به‌روزرسانی جستجو
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Premium Stories Row */}
            {stories.length > 0 && (
                <section className="bg-white border-b border-gray-100 py-6">
                    <div className="container mx-auto px-6 flex gap-6 overflow-x-auto no-scrollbar">
                        {stories.map((group, index) => (
                            <div
                                key={group.id}
                                className="flex flex-col items-center gap-3 cursor-pointer group shrink-0"
                                onClick={() => {
                                    setSelectedStoryIndex(index);
                                    // Track group opening (CTR)
                                    fetch(`http://localhost:8080/api/public/stories/group-open/${group.id}`, { method: 'POST' })
                                        .catch(err => console.error('Failed to track story opening:', err));
                                }}
                            >
                                <div className="p-1 rounded-full border-2 border-red-600   group-active:scale-95 shadow-lg shadow-red-50">
                                    <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden relative shadow-inner">
                                        {group.cover_url ? (
                                            <img
                                                src={group.cover_url.startsWith('http') ? group.cover_url : `http://localhost:8080${group.cover_url}`}
                                                alt={group.title_fa}
                                                className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0"
                                            />
                                        ) : (group.slides[0]?.thumbnail_url || group.slides[0]?.image_url) ? (
                                            <img
                                                src={`http://localhost:8080${group.slides[0]?.thumbnail_url || group.slides[0]?.image_url}`}
                                                alt={group.title_fa}
                                                className="w-full h-full object-cover grayscale-[0.3] "
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center text-white text-lg font-black"
                                                style={{ backgroundColor: group.slides[0]?.background_color || '#333' }}
                                            >
                                                {group.title_fa.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest transition-colors group-hover:text-red-600">
                                    {group.caption || group.title_fa}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {selectedStoryIndex !== null && (
                <StoryViewer
                    groups={stories}
                    initialGroupIndex={selectedStoryIndex}
                    onClose={() => setSelectedStoryIndex(null)}
                />
            )}

            <div className="container mx-auto px-6 py-12 grid lg:grid-cols-4 gap-12">
                {/* Sidebar */}
                <aside className="hidden lg:block">
                    <div className="sticky top-32">
                        <HotelFilters />
                    </div>
                </aside>

                {/* Results Area */}
                <main className="lg:col-span-3 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">

                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{filteredHotels.length} هتل موجود است</span>
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">بهترین هتل‌های {searchTerm}</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-red-600 hover:border-red-100 transition-all">
                                <Filter size={14} />
                                فیلترهای هوشمند
                            </button>
                            <div className="flex items-center bg-gray-100 p-1 rounded-2xl">
                                <button className="px-4 py-2 bg-white text-gray-900 rounded-xl text-[10px] font-bold shadow-sm">پیشنهادی</button>
                                <button className="px-4 py-2 text-gray-400 rounded-xl text-[10px] font-bold hover:text-gray-900">ارزان‌ترین</button>
                            </div>
                        </div>
                    </div>

                    {/* Hotel Cards List */}
                    <div className="grid grid-cols-1 gap-8">
                        {filteredHotels.map((hotel) => (
                            <div key={hotel.id} className="group bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200 transition-all overflow-hidden flex flex-col md:flex-row h-full md:h-72">
                                {/* Image Box */}
                                <div className="w-full md:w-80 relative overflow-hidden shrink-0">
                                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl text-[10px] font-bold text-gray-900 shadow-xl border border-white/20">
                                        HOT HOTEL
                                    </div>
                                    <button className="absolute bottom-4 right-4 w-10 h-10 bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                                        <Heart size={20} />
                                    </button>
                                </div>

                                {/* Content Box */}
                                <div className="flex-1 p-8 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-2xl font-black text-gray-900 group-hover:text-red-600 transition-colors tracking-tight">{hotel.name}</h3>
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} className={i < hotel.stars ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-100"} />
                                                    ))}
                                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mr-2">{hotel.stars} STARS LUXURY</span>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <div className="text-3xl font-black text-red-600 leading-none">{hotel.rating}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Excellent</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-red-600">
                                                <MapPin size={16} />
                                            </div>
                                            {hotel.location}
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between mt-8 border-t border-gray-50 pt-6">
                                        <div className="flex gap-2">
                                            <span className="bg-green-50 text-green-600 px-3 py-1 rounded-xl text-[10px] font-bold uppercase">کنسلی رایگان</span>
                                            <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-xl text-[10px] font-bold uppercase">تخفیف ویژه</span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-left">
                                                <div className="text-xs font-medium text-gray-400 line-through">۹,۸۰۰,۰۰۰</div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-black text-gray-900">{hotel.price}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">تومان / شب</span>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/hotel-booking/${city_slug}/${hotel.name.replace(/\s+/g, '-')}${dateFrom ? `?date_from=${dateFrom}&date_to=${dateTo}&nights=${nightsParam}` : ""}`}
                                                className="px-8 py-3 bg-red-600 text-white rounded-2xl text-[10px] font-bold shadow-xl shadow-red-100 group-hover:bg-red-700 active:scale-95 transition-all"
                                            >
                                                مشاهده قیمت‌ها
                                            </Link>
                                            <Link
                                                href={`/hotel-booking/${city_slug}/${hotel.name.replace(/\s+/g, '-')}${dateFrom ? `?date_from=${dateFrom}&date_to=${dateTo}&nights=${nightsParam}` : ""}`}
                                                className="w-12 h-12 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-gray-50 transition-all"
                                            >
                                                <ArrowRight size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
