"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { apiRequest } from "@/lib/api";

interface Slide {
    id: number;
    image_url: string;
    caption_fa: string;
    sort_order: number;
}

interface Group {
    id: number;
    title_fa: string;
    slides: Slide[];
}

interface StoryViewerProps {
    groups: Group[];
    initialGroupIndex?: number;
    onClose: () => void;
}

const API_BASE_URL = "http://localhost:8080"; // For images

export default function StoryViewer({ groups, initialGroupIndex = 0, onClose }: StoryViewerProps) {
    const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    const currentGroup = groups[currentGroupIndex];
    const currentSlide = currentGroup?.slides[currentSlideIndex];

    useEffect(() => {
        // Auto-advance
        const timer = setTimeout(() => {
            handleNext();
        }, 5000);
        return () => clearTimeout(timer);
    }, [currentSlideIndex, currentGroupIndex]);

    useEffect(() => {
        // Track open
        if (currentSlide) {
            fetch(`${API_BASE_URL}/api/public/stories/open/${currentSlide.id}`, { method: 'POST' });
        }
    }, [currentSlide]);

    const handleNext = () => {
        if (currentSlideIndex < currentGroup.slides.length - 1) {
            setCurrentSlideIndex(prev => prev + 1);
        } else if (currentGroupIndex < groups.length - 1) {
            setCurrentGroupIndex(prev => prev + 1);
            setCurrentSlideIndex(0);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(prev => prev - 1);
        } else if (currentGroupIndex > 0) {
            setCurrentGroupIndex(prev => prev - 1);
            setCurrentSlideIndex(groups[currentGroupIndex - 1].slides.length - 1);
        }
    };

    if (!currentGroup || !currentSlide) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            <button onClick={onClose} className="absolute top-4 right-4 z-50 text-white">
                <X className="h-8 w-8" />
            </button>

            <div className="relative w-full h-full md:w-[400px] md:h-[80vh] bg-black md:rounded-xl overflow-hidden shadow-2xl">
                {/* Progress Bar */}
                <div className="absolute top-2 left-0 right-0 z-20 flex gap-1 px-2">
                    {currentGroup.slides.map((s, idx) => (
                        <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-white transition-all duration-300 ${idx < currentSlideIndex ? 'w-full' : idx === currentSlideIndex ? 'animate-progress' : 'w-0'}`}
                                style={{ width: idx < currentSlideIndex ? '100%' : idx === currentSlideIndex ? 'auto' : '0%' }}
                            />
                            {/* Note: animation needs custom CSS keyframes, simplifying for MVP */}
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-6 left-0 right-0 z-20 px-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-600 border border-white flex items-center justify-center text-xs text-white font-bold">
                        {currentGroup.title_fa.charAt(0)}
                    </div>
                    <span className="text-white text-sm font-medium drop-shadow-md">{currentGroup.title_fa}</span>
                </div>

                {/* Image */}
                <img
                    src={`${API_BASE_URL}${currentSlide.image_url}`}
                    alt={currentSlide.caption_fa}
                    className="w-full h-full object-cover"
                />

                {/* Navigation Overlay */}
                <div className="absolute inset-0 z-10 flex">
                    <div className="w-1/3 h-full" onClick={handlePrev} />
                    <div className="w-1/3 h-full" onClick={handleNext} /> {/* Middle tap advances too */}
                    <div className="w-1/3 h-full" onClick={handleNext} />
                </div>

                {/* Caption */}
                {currentSlide.caption_fa && (
                    <div className="absolute bottom-10 left-0 right-0 z-20 p-4 text-center">
                        <p className="text-white text-lg font-bold bg-black/40 inline-block px-4 py-2 rounded-lg backdrop-blur-sm">
                            {currentSlide.caption_fa}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
