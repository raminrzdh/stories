"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, MapPin, Star, Share2, Heart, Wifi, Coffee, Car, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import StoryViewer from "@/components/story-viewer";

// Mock Data for a single hotel (In a real app, fetch based on hotel_slug)
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
    const [stories, setStories] = useState<any[]>([]);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                // Fetch stories for the CITY of this hotel
                const data = await apiRequest(`/public/stories/${city_slug}`);
                setStories(data || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStories();
    }, [city_slug]);

    const decodedHotelName = decodeURIComponent(hotel_slug as string).replace(/-/g, " ");

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-[family-name:var(--font-estedad)]">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/hotel-booking/${city_slug}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowRight className="w-5 h-5 text-gray-600" />
                        </Button>
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold text-gray-900">{decodedHotelName}</h1>
                        <span className="text-xs text-gray-500">{decodeURIComponent(city_slug as string)}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                        <Heart className="w-5 h-5 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Share2 className="w-5 h-5 text-gray-600" />
                    </Button>
                </div>
            </header>

            {/* Stories Section (Integrated) */}
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

            {/* Hotel Content */}
            <main className="container mx-auto px-0 md:px-4 md:py-6 space-y-6">
                {/* Hero Image */}
                <div className="relative w-full h-64 md:h-96 md:rounded-2xl overflow-hidden">
                    <img
                        src={MOCK_HOTEL_DETAILS.image}
                        alt={MOCK_HOTEL_DETAILS.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white md:hidden">
                        <h2 className="text-xl font-bold">{MOCK_HOTEL_DETAILS.name}</h2>
                        <div className="flex items-center gap-1 mt-1 text-sm">
                            <MapPin className="w-4 h-4" />
                            {MOCK_HOTEL_DETAILS.location}
                        </div>
                    </div>
                </div>

                <div className="px-4 md:px-0 space-y-6">
                    {/* Desktop Title & Rating */}
                    <div className="hidden md:flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{decodedHotelName}</h1>
                            <div className="flex items-center gap-2 mt-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                {MOCK_HOTEL_DETAILS.location}
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600">{MOCK_HOTEL_DETAILS.reviews} نظر</span>
                                <div className="bg-red-600 text-white px-2 py-1 rounded-lg font-bold">
                                    {MOCK_HOTEL_DETAILS.rating}
                                </div>
                            </div>
                            <div className="flex gap-1 mt-1">
                                {[...Array(MOCK_HOTEL_DETAILS.stars)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {MOCK_HOTEL_DETAILS.amenities.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white p-3 rounded-lg border text-sm text-gray-700">
                                <item.icon className="w-5 h-5 text-gray-400" />
                                {item.label}
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    <div className="bg-white p-4 rounded-xl border space-y-2">
                        <h3 className="font-bold text-gray-900">درباره هتل</h3>
                        <p className="text-gray-600 leading-relaxed text-sm md:text-base text-justify">
                            {MOCK_HOTEL_DETAILS.description}
                        </p>
                    </div>
                </div>
            </main>

            {/* Bottom Bar Price */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40 flex items-center justify-between md:hidden">
                <div>
                    <span className="text-xs text-gray-500">شروع قیمت از</span>
                    <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-gray-900">{MOCK_HOTEL_DETAILS.price}</span>
                        <span className="text-xs text-gray-500">تومان</span>
                    </div>
                </div>
                <Button className="bg-red-600 px-8">انتخاب اتاق</Button>
            </div>

            {/* Story Viewer Modal */}
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
