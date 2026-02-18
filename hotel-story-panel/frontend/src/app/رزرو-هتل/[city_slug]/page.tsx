"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Correct hook for App Router params
import { AnimatePresence, motion } from "framer-motion";
import { apiRequest } from "@/lib/api";
import StoryViewer from "@/components/story-viewer";

// Mock Hotel Results
const HOTELS = [
    { id: 1, name: "هتل اسپیناس پالاس", price: "۸,۵۰۰,۰۰۰ تومان", image: "https://placehold.co/600x400?text=Hotel+1" },
    { id: 2, name: "هتل پارسیان آزادی", price: "۶,۲۰۰,۰۰۰ تومان", image: "https://placehold.co/600x400?text=Hotel+2" },
    { id: 3, name: "هتل استقلال", price: "۵,۱۰۰,۰۰۰ تومان", image: "https://placehold.co/600x400?text=Hotel+3" },
];

export default function SearchPage({ params }: { params: { city_slug: string } }) {
    // In Next.js App Router, params is a Promise in newer versions or prop. 
    // Wait, params is passed as prop to page.tsx, but client components might need React.use() or useParams().
    // Since this is "use client", let's use useParams() for simplicity and safety or just props.
    // Actually, page props are async in Next 15.
    // Let's use unwrapped params prop safely.
    // But useParams() is client-side hook.
    const { city_slug } = useParams();

    const [stories, setStories] = useState<any[]>([]);
    const [viewingStory, setViewingStory] = useState(false);
    const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

    useEffect(() => {
        if (city_slug) {
            fetch(`http://localhost:8080/api/public/stories/${city_slug}`)
                .then(res => res.json())
                .then(data => setStories(data))
                .catch(err => console.error(err));
        }
    }, [city_slug]);

    const handleStoryClick = (index: number) => {
        setSelectedGroupIndex(index);
        setViewingStory(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm p-4 sticky top-0 z-30">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-blue-600">رزرو هتل {city_slug}</h1>
                    <button className="text-sm text-gray-500">فیلترها</button>
                </div>
            </header>

            {/* Stories Section */}
            {stories.length > 0 && (
                <div className="bg-white border-b py-4">
                    <div className="container mx-auto px-4 overflow-x-auto flex gap-4 no-scrollbar">
                        {stories.map((group, idx) => (
                            <div key={group.id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleStoryClick(idx)}>
                                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600">
                                    <div className="w-full h-full rounded-full bg-white p-[2px]">
                                        <img
                                            src={group.slides[0]?.thumbnail_url || `http://localhost:8080${group.slides[0]?.image_url}` || "https://placehold.co/100x100"}
                                            alt={group.title_fa}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                </div>
                                <span className="text-xs text-gray-700 truncate w-16 text-center">{group.title_fa}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Hotel List */}
            <div className="container mx-auto p-4 space-y-4">
                {HOTELS.map(hotel => (
                    <div key={hotel.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                        <img src={hotel.image} alt={hotel.name} className="w-full md:w-48 h-48 object-cover" />
                        <div className="p-4 flex flex-col justify-between flex-1">
                            <div>
                                <h3 className="text-lg font-bold">{hotel.name}</h3>
                                <p className="text-gray-500 text-sm mt-1">۵ ستاره - سعادت آباد</p>
                            </div>
                            <div className="flex justify-between items-end mt-4">
                                <span className="text-lg font-bold text-blue-600">{hotel.price}</span>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">مشاهده و رزرو</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Story Modal */}
            <AnimatePresence>
                {viewingStory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50"
                    >
                        <StoryViewer
                            groups={stories}
                            initialGroupIndex={selectedGroupIndex}
                            onClose={() => setViewingStory(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
