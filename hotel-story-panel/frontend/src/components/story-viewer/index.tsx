"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink, ChevronRight, ChevronLeft } from "lucide-react";

interface Slide {
    id: number;
    image_url: string;
    caption_fa: string;
    elements?: any;
    sort_order: number;
    duration?: number;
    background_color?: string;
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

const API_BASE_URL = "http://localhost:8080";

export default function StoryViewer({ groups, initialGroupIndex = 0, onClose }: StoryViewerProps) {
    const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const currentGroup = groups[currentGroupIndex];
    const currentSlide = currentGroup?.slides?.[currentSlideIndex];

    useEffect(() => {
        setProgress(0);
    }, [currentSlideIndex, currentGroupIndex]);

    useEffect(() => {
        if (!currentSlide) return;

        const duration = (currentSlide.duration || 7) * 1000;
        const interval = 50;
        const step = 100 / (duration / interval);

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    handleNext();
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [currentSlideIndex, currentGroupIndex]);

    useEffect(() => {
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

    const bgStyle = currentSlide.image_url
        ? { backgroundImage: `url(${API_BASE_URL}${currentSlide.image_url})` }
        : { backgroundColor: currentSlide.background_color || '#000000' };

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center font-sans">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
            >
                <X size={32} />
            </button>

            <div
                className="relative w-full h-full md:w-[420px] md:h-[85vh] bg-black md:rounded-[40px] overflow-hidden shadow-2xl bg-cover bg-center bg-no-repeat border-4 border-white/5"
                style={bgStyle}
            >
                {/* Progress Indicators */}
                <div className="absolute top-4 left-0 right-0 z-20 flex gap-1.5 px-4 h-1">
                    {currentGroup.slides.map((s, idx) => (
                        <div key={s.id} className="h-full flex-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-75 linear shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                                style={{
                                    width: idx < currentSlideIndex ? '100%' :
                                        idx === currentSlideIndex ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-8 left-0 right-0 z-20 px-6 flex items-center gap-3" style={{ direction: 'rtl' }}>
                    <div className="w-9 h-9 rounded-full bg-red-600 border-2 border-white/50 flex items-center justify-center text-sm text-white font-black shadow-lg">
                        {currentGroup.title_fa.charAt(0)}
                    </div>
                    <span className="text-white text-base font-black drop-shadow-lg">{currentGroup.title_fa}</span>
                </div>

                {/* Navigation Hotspots */}
                <div className="absolute inset-0 z-10 flex">
                    <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
                    <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
                </div>

                {/* Elements Layer */}
                <div className="absolute inset-0 z-[60] pointer-events-none">
                    {(() => {
                        let elements: any[] = [];
                        try {
                            if (typeof currentSlide.elements === 'string') elements = JSON.parse(currentSlide.elements);
                            else if (Array.isArray(currentSlide.elements)) elements = currentSlide.elements;
                            else if (typeof currentSlide.elements === 'object') elements = Object.values(currentSlide.elements);
                        } catch (e) { }

                        return elements.map((el, i) => (
                            <div
                                key={i}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                                style={{
                                    left: `${el.x}%`,
                                    top: `${el.y}%`,
                                    direction: 'rtl'
                                }}
                            >
                                {el.type === 'link' && (
                                    <a
                                        href={el.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-white text-black px-6 py-2.5 rounded-full font-black text-sm shadow-[0_8px_30px_rgb(0,0,0,0.2)] whitespace-nowrap flex items-center gap-2 transition-transform hover:scale-110 active:scale-95 border border-gray-100"
                                    >
                                        {el.text}
                                        <ExternalLink size={16} strokeWidth={3} />
                                    </a>
                                )}
                                {el.type === 'slider' && (
                                    <div
                                        className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl w-56 border border-white/20"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-2xl animate-bounce">{el.emoji}</span>
                                            <div className="flex-1 mx-3">
                                                <input
                                                    type="range"
                                                    disabled
                                                    className="w-full h-1.5 bg-gray-200 rounded-full appearance-none accent-red-600"
                                                    style={{ direction: 'ltr' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {el.type === 'text' && (
                                    <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-2xl text-black text-lg font-black whitespace-nowrap border border-white/20 select-none">
                                        {el.content}
                                    </div>
                                )}
                            </div>
                        ));
                    })()}
                </div>
            </div>

            {/* Side Navigation for Desktop */}
            <div className="hidden lg:flex absolute inset-x-0 top-1/2 -translate-y-1/2 justify-between px-20 pointer-events-none">
                <button
                    onClick={handlePrev}
                    className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all pointer-events-auto"
                >
                    <ChevronRight size={40} />
                </button>
                <button
                    onClick={handleNext}
                    className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all pointer-events-auto"
                >
                    <ChevronLeft size={40} />
                </button>
            </div>
        </div>
    );
}
