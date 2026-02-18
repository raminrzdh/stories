"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StoryViewer from "@/components/story-viewer";
import { apiRequest } from "@/lib/api";
import { MapPin, Star, Filter, SlidersHorizontal, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";

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
        id: 3,
        name: "هاستل شیراز (Shiraz Hostel)",
        stars: 2,
        rating: 4.5,
        reviews: 850,
        price: "۸۵۰,۰۰۰",
        image: "https://images.unsplash.com/photo-1555854743-e3c2f6a53995?q=80&w=2070&auto=format&fit=crop",
        location: "شیراز، خیابان لطفعلی خان زند"
    },
    {
        id: 4,
        name: "هتل بزرگ چمران",
        stars: 5,
        rating: 4.7,
        reviews: 3100,
        price: "۶,۹۰۰,۰۰۰",
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop",
        location: "شیراز، بلوار چمران"
    }
];

export default function SearchResults() {
    const { city_slug } = useParams();
    const [stories, setStories] = useState<any[]>([]);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

    // Use loading state if needed, but for now just fetch
    // const [loadingStories, setLoadingStories] = useState(true);

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

    // Filter hotels based on city_slug (simple mock logic)
    const normalizedSlug = (city_slug as string).toLowerCase();
    const filteredHotels = MOCK_HOTELS.filter(h => {
        if (normalizedSlug.includes("tehran")) return h.location.includes("تهران");
        if (normalizedSlug.includes("shiraz")) return h.location.includes("شیراز");
        return true; // Show all if slug doesn't match mock data logic
    });

    return (
        <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-estedad)] pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40 px-4 py-3 flex items-center gap-4">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="shrink-0">
                        <ArrowRight className="w-5 h-5 text-gray-600" />
                    </Button>
                </Link>
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">H</div>
                <div className="flex-1 overflow-x-auto no-scrollbar">
                    <div className="bg-gray-100 rounded-full px-4 py-2 text-sm flex items-center gap-2 text-gray-600 border cursor-pointer hover:bg-gray-200 transition whitespace-nowrap w-fit">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium text-gray-900">{city_slug}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-xs">۵ اسفند - ۸ اسفند (۳ شب)</span>
                    </div>
                </div>
            </header>

            {/* Stories Section */}
            {stories.length > 0 && (
                <section className="bg-white border-b py-4 overflow-x-auto no-scrollbar">
                    <div className="container mx-auto px-4 flex gap-4">
                        {stories.map((group, index) => (
                            <div
                                key={group.id}
                                className="flex flex-col items-center gap-2 cursor-pointer group min-w-[70px]"
                                onClick={() => setSelectedStoryIndex(index)}
                            >
                                <div className="w-[66px] h-[66px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600 group-hover:scale-105 transition-transform">
                                    <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                                        <img
                                            src={`http://localhost:8080${group.slides[0]?.thumbnail_url || group.slides[0]?.image_url}`}
                                            alt={group.title_fa}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <span className="text-xs text-gray-700 truncate max-w-[70px]">{group.title_fa}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Story Viewer Modal */}
            {selectedStoryIndex !== null && (
                <StoryViewer
                    groups={stories}
                    initialGroupIndex={selectedStoryIndex}
                    onClose={() => setSelectedStoryIndex(null)}
                />
            )}

            <div className="container mx-auto px-4 py-6 grid lg:grid-cols-4 gap-6">

                {/* Sidebar Filters */}
                <aside className="hidden lg:block space-y-6">
                    <div className="bg-white p-4 rounded-xl border sticky top-24">
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
                </aside>

                {/* Main Results */}
                <main className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="font-bold text-xl text-gray-900">
                            هتل‌های {city_slug}
                            <span className="text-sm font-normal text-gray-500 mr-2">({filteredHotels.length} مورد یافت شد)</span>
                        </h1>
                        <Button variant="outline" size="sm" className="lg:hidden">
                            <SlidersHorizontal className="w-4 h-4 ml-2" />
                            فیلترها
                        </Button>

                        <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600">
                            <span>مرتب‌سازی:</span>
                            <select className="bg-transparent font-medium text-gray-900 outline-none cursor-pointer">
                                <option>پیشنهاد ما</option>
                                <option>قیمت: کم به زیاد</option>
                                <option>قیمت: زیاد به کم</option>
                                <option>بالاترین امتیاز</option>
                            </select>
                        </div>
                    </div>

                    {/* Hotel List */}
                    <div className="space-y-4">
                        {filteredHotels.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border">
                                <p className="text-gray-500">هیچ هتلی برای این شهر یافت نشد.</p>
                            </div>
                        ) : filteredHotels.map((hotel) => (
                            <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm ring-1 ring-gray-200">
                                <div className="flex flex-col md:flex-row">
                                    {/* Image */}
                                    <div className="w-full md:w-64 h-48 md:h-auto relative shrink-0">
                                        <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                                        {hotel.id === 3 && (
                                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-bold shadow-sm">
                                                ویژه
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{hotel.name}</h3>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                                        {[...Array(hotel.stars)].map((_, i) => (
                                                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                        ))}
                                                        <span>هتل {hotel.stars} ستاره</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="bg-red-600 text-white text-sm font-bold w-8 h-8 rounded-lg flex items-center justify-center shadow-sm">
                                                        {hotel.rating}
                                                    </div>
                                                    <span className="text-xs text-gray-500 mt-1">{hotel.reviews} نظر</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                                <MapPin className="w-4 h-4" />
                                                {hotel.location}
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between mt-4 md:mt-0">
                                            <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded border border-green-100">
                                                کنسلی رایگان
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs text-gray-500 line-through">۱۵٪ تخفیف</div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xl font-bold text-gray-900">{hotel.price}</span>
                                                    <span className="text-xs text-gray-500">تومان / شب</span>
                                                </div>
                                                <Button className="mt-2 w-full md:w-auto px-6 bg-red-600 hover:bg-blue-700 shadow-sm shadow-blue-200">
                                                    مشاهده و رزرو
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
