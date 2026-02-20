"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { Point, Area } from "react-easy-crop";
import { Plus, X, Type, Link as LinkIcon, Heart, Save, Image as ImageIcon, Palette, Trash2, ChevronLeft } from "lucide-react";

// Helper to create valid image file from crop
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });

async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area
): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("No 2d context");
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((file) => {
            if (file) {
                resolve(file);
            } else {
                reject(new Error("Canvas is empty"));
            }
        }, "image/jpeg");
    });
}

interface Element {
    type: 'link' | 'slider' | 'text';
    text?: string;
    url?: string;
    emoji?: string;
    content?: string; // for text element
    x: number;
    y: number;
}

interface StoryBuilderProps {
    onUpload: (file: Blob | null, elements: Element[], duration: number, backgroundColor: string | null) => void;
    initialData?: {
        image_url?: string;
        elements?: Element[];
        duration?: number;
        background_color?: string | null;
    };
}

export default function StoryBuilder({ onUpload, initialData }: StoryBuilderProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(
        initialData?.image_url ? `http://localhost:8080${initialData.image_url}` : null
    );
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [elements, setElements] = useState<Element[]>(initialData?.elements || []);

    // UI state
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [linkText, setLinkText] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [textContent, setTextContent] = useState('');

    // New states for enhanced features
    const [duration, setDuration] = useState<number>(initialData?.duration || 7);
    const [bgMode, setBgMode] = useState<'image' | 'color'>(
        initialData?.image_url ? 'image' : 'color'
    );
    const [bgColor, setBgColor] = useState<string>(initialData?.background_color || '#ffffff');

    const [error, setError] = useState<string | null>(null);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setError("فرمت فایل نامعتبر است.");
                return;
            }
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl);
            setBgMode('image');
            setError(null);
        }
    };

    const containerRef = useRef<HTMLDivElement>(null);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    const handlePointerDown = (index: number, e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggingIndex(index);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (draggingIndex === null || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        let x = ((e.clientX - rect.left) / rect.width) * 100;
        let y = ((e.clientY - rect.top) / rect.height) * 100;
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
        const newElements = [...elements];
        newElements[draggingIndex] = { ...newElements[draggingIndex], x, y };
        setElements(newElements);
    };

    const handlePointerUp = () => setDraggingIndex(null);

    const readFile = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });
    };

    const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (bgMode === 'image' && imageSrc && croppedAreaPixels) {
            try {
                const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
                onUpload(croppedImage, elements, duration, null);
            } catch (e) {
                console.error(e);
            }
        } else if (bgMode === 'color') {
            onUpload(null, elements, duration, bgColor);
        }
    };

    const addLink = () => {
        if (!linkText || !linkUrl) return;
        setElements([...elements, { type: 'link', text: linkText, url: linkUrl, x: 50, y: 80 }]);
        setLinkText(""); setLinkUrl(""); setActiveTool(null);
    };

    const addSlider = () => {
        if (elements.some(e => e.type === 'slider')) return;
        setElements([...elements, { type: 'slider', emoji: '😍', x: 50, y: 50 }]);
    };

    const addText = () => {
        if (!textContent.trim()) return;
        setElements([...elements, { type: 'text', content: textContent, x: 50, y: 50 }]);
        setTextContent(''); setActiveTool(null);
    };

    const removeElement = (index: number) => {
        setElements(elements.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col md:flex-row h-full">
            {/* Preview Section */}
            <div className="flex-1 bg-gray-900 flex items-center justify-center p-8 overflow-hidden">
                <div
                    ref={containerRef}
                    className="relative w-full max-w-[360px] aspect-[9/16] bg-white rounded-3xl shadow-2xl overflow-hidden touch-none border-4 border-gray-800"
                    style={{ backgroundColor: bgMode === 'color' ? bgColor : undefined }}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    {bgMode === 'image' && imageSrc ? (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={9 / 16}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    ) : bgMode === 'image' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-100 p-6 text-center">
                            <ImageIcon size={48} className="mb-4 opacity-20" />
                            <p className="font-bold text-sm">عکسی انتخاب نشده است</p>
                            <label className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-red-700 transition">
                                انتخاب عکس
                                <input type="file" className="hidden" onChange={onFileChange} />
                            </label>
                        </div>
                    ) : null}

                    {/* Overlay Elements */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                        {elements.map((el, i) => (
                            <div
                                key={i}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move pointer-events-auto ${draggingIndex === i ? 'opacity-80 scale-105 select-none' : ''}`}
                                style={{ left: `${el.x}%`, top: `${el.y}%`, touchAction: 'none' }}
                                onPointerDown={(e) => handlePointerDown(i, e)}
                            >
                                {el.type === 'link' && (
                                    <div className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm shadow-xl whitespace-nowrap border border-gray-200">
                                        {el.text} ↗
                                    </div>
                                )}
                                {el.type === 'slider' && (
                                    <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl w-48 border border-white/20">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-2xl">{el.emoji}</span>
                                            <div className="h-1.5 flex-1 bg-gray-100 rounded-full mx-2"></div>
                                        </div>
                                    </div>
                                )}
                                {el.type === 'text' && (
                                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-xl text-black text-lg font-black whitespace-nowrap border border-white/20">
                                        {el.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar Controls */}
            <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col h-full shadow-2xl">
                <div className="p-6 overflow-y-auto flex-1 space-y-8">
                    {/* Background Settings */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Palette size={16} />
                            تنظیمات زمینه
                        </h3>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-xl">
                            <button
                                onClick={() => setBgMode('color')}
                                className={`py-2 rounded-lg text-sm font-bold transition-all ${bgMode === 'color' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                رنگ ساده
                            </button>
                            <button
                                onClick={() => setBgMode('image')}
                                className={`py-2 rounded-lg text-sm font-bold transition-all ${bgMode === 'image' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                تصویر
                            </button>
                        </div>

                        {bgMode === 'color' ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700">انتخاب رنگ:</span>
                                <input
                                    type="color"
                                    value={bgColor}
                                    onChange={e => setBgColor(e.target.value)}
                                    className="w-10 h-10 p-0 border-0 bg-transparent cursor-pointer rounded-lg overflow-hidden"
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:bg-gray-50 transition cursor-pointer group">
                                    <ImageIcon size={32} className="text-gray-300 group-hover:text-red-400 mb-2 transition" />
                                    <span className="text-xs font-bold text-gray-500">تغییر عکس</span>
                                    <input type="file" className="hidden" onChange={onFileChange} />
                                </label>
                                {imageSrc && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-gray-400">
                                            <span>بزرگنمایی تصویر</span>
                                            <span>{zoom.toFixed(1)}x</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={1} max={3} step={0.1}
                                            value={zoom}
                                            onChange={e => setZoom(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-red-600"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Duration Settings */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            مدت نمایش
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="flex justify-between mb-3">
                                <span className="text-xl font-black text-gray-900">{duration} ثانیه</span>
                                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">حداکثر ۳۰ ثانیه</span>
                            </div>
                            <input
                                type="range"
                                min={1} max={30}
                                value={duration}
                                onChange={e => setDuration(parseInt(e.target.value))}
                                className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-red-600"
                            />
                        </div>
                    </section>

                    {/* Add Elements */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            افزودن المان
                        </h3>
                        <div className="flex gap-2">
                            {[
                                { id: 'text', icon: Type, label: 'متن' },
                                { id: 'link', icon: LinkIcon, label: 'لینک' },
                                { id: 'slider', icon: Heart, label: 'لایک' }
                            ].map(tool => (
                                <button
                                    key={tool.id}
                                    onClick={() => tool.id === 'slider' ? addSlider() : setActiveTool(tool.id)}
                                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${activeTool === tool.id ? 'border-red-600 bg-red-50 text-red-600' : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-200'
                                        }`}
                                >
                                    <tool.icon size={20} />
                                    <span className="text-[10px] font-bold">{tool.label}</span>
                                </button>
                            ))}
                        </div>

                        {activeTool === 'text' && (
                            <div className="bg-gray-50 p-4 rounded-2xl border border-red-100 animate-in slide-in-from-top-2 duration-200">
                                <textarea
                                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-red-100"
                                    placeholder="متن خود را اینجا بنویسید..."
                                    rows={2}
                                    value={textContent}
                                    onChange={e => setTextContent(e.target.value)}
                                />
                                <div className="flex gap-2 mt-3">
                                    <button onClick={addText} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-bold shadow-md shadow-red-100">درج در صفحه</button>
                                    <button onClick={() => setActiveTool(null)} className="px-4 text-xs font-bold text-gray-400">لغو</button>
                                </div>
                            </div>
                        )}

                        {activeTool === 'link' && (
                            <div className="bg-gray-50 p-4 rounded-2xl border border-red-100 animate-in slide-in-from-top-2 duration-200 space-y-3">
                                <input
                                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none"
                                    placeholder="متن دکمه"
                                    value={linkText}
                                    onChange={e => setLinkText(e.target.value)}
                                />
                                <input
                                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none dir-ltr"
                                    placeholder="https://..."
                                    value={linkUrl}
                                    onChange={e => setLinkUrl(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <button onClick={addLink} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-bold shadow-md shadow-red-100">درج دکمه</button>
                                    <button onClick={() => setActiveTool(null)} className="px-4 text-xs font-bold text-gray-400">لغو</button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Active Elements List */}
                    {elements.length > 0 && (
                        <section className="space-y-3">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mr-1">لیست المان‌ها</h3>
                            {elements.map((el, i) => (
                                <div key={i} className="flex items-center justify-between bg-white border border-gray-100 px-4 py-3 rounded-xl shadow-sm group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                            {el.type === 'text' ? <Type size={16} /> : el.type === 'link' ? <LinkIcon size={16} /> : <Heart size={16} />}
                                        </div>
                                        <span className="text-xs font-bold text-gray-800 line-clamp-1">
                                            {el.type === 'text' ? el.content : el.type === 'link' ? el.text : 'اسلایدر تعاملی'}
                                        </span>
                                    </div>
                                    <button onClick={() => removeElement(i)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </section>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="flex-1 py-4 text-sm font-black text-gray-400 hover:bg-white rounded-2xl transition-all"
                    >
                        لغو و بازگشت
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-[2] bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        <Save size={20} />
                        ذخیره استوری
                    </button>
                </div>
            </div>
        </div>
    );
}
