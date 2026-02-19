"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Point, Area } from "react-easy-crop";
import { Button } from "@/components/ui/button"; // Re-add Button import

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
    type: 'link' | 'slider';
    text?: string;
    url?: string;
    emoji?: string;
    x: number;
    y: number;
}

interface StoryBuilderProps {
    onUpload: (file: Blob, elements: Element[]) => void;
}

export default function StoryBuilder({ onUpload }: StoryBuilderProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [elements, setElements] = useState<Element[]>([]);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkText, setLinkText] = useState("");
    const [linkUrl, setLinkUrl] = useState("");

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl);
            setElements([]); // Reset elements on new file
        }
    };

    const readFile = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener("load", () => resolve(reader.result as string), false);
            reader.readAsDataURL(file);
        });
    };

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (imageSrc && croppedAreaPixels) {
            try {
                const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
                onUpload(croppedImage, elements);
                setImageSrc(null); // Reset
                setElements([]);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const addLink = () => {
        if (!linkText || !linkUrl) return;
        setElements([...elements, { type: 'link', text: linkText, url: linkUrl, x: 50, y: 80 }]);
        setLinkText("");
        setLinkUrl("");
        setShowLinkInput(false);
    };

    const addSlider = () => {
        // Prevent multiple sliders for MVP simplicity
        if (elements.some(e => e.type === 'slider')) return;
        setElements([...elements, { type: 'slider', emoji: '😍', x: 50, y: 50 }]);
    };

    const removeElement = (index: number) => {
        setElements(elements.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full">
            {!imageSrc ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:bg-gray-50 transition">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        className="hidden"
                        id="story-upload"
                    />
                    <label htmlFor="story-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                        <span className="text-gray-600 font-medium">آپلود تصویر استوری (1080x1920)</span>
                        <span className="text-gray-400 text-sm mt-1">تپ کنید یا فایل را اینجا رها کنید</span>
                    </label>
                </div>
            ) : (
                <div className="fixed inset-0 z-50 bg-black/90 flex flex-col md:flex-row">
                    {/* Preview Area */}
                    <div className="relative flex-1 bg-gray-900 flex items-center justify-center p-4">
                        <div className="relative w-full max-w-[400px] aspect-[9/16] bg-black rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={9 / 16}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />

                            {/* Overlay Elements (Visual Preview - approximate checking) */}
                            {/* Note: In a real app we'd need to map crop coordinates to overlay. 
                                For MVP we just show them "on top" relative to the frame, 
                                assuming the user crops to the full visible area. 
                                Since elements are properly rendered in Viewer, this is a 'good enough' preview. 
                            */}
                            <div className="absolute inset-0 pointer-events-none z-10">
                                {elements.map((el, i) => (
                                    <div
                                        key={i}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                        style={{ left: `${el.x}%`, top: `${el.y}%` }}
                                    >
                                        {el.type === 'link' && (
                                            <div className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm shadow-lg whitespace-nowrap">
                                                {el.text} ↗
                                            </div>
                                        )}
                                        {el.type === 'slider' && (
                                            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg w-48">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xl">{el.emoji}</span>
                                                    <div className="h-1 flex-1 bg-gray-200 rounded-full mx-2"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="w-full md:w-96 bg-white p-6 flex flex-col gap-6 overflow-y-auto">
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-gray-900">تنظیمات تصویر</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-sm font-medium text-gray-700">بزرگنمایی</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900">افزودن المان</h3>

                            {/* Link Button */}
                            {!showLinkInput ? (
                                <Button variant="outline" className="w-full justify-start text-gray-700 border-gray-300 hover:bg-gray-50" onClick={() => setShowLinkInput(true)}>
                                    + افزودن دکمه لینک
                                </Button>
                            ) : (
                                <div className="p-3 border rounded-lg space-y-2 bg-gray-50">
                                    <input
                                        className="w-full p-2 border rounded text-gray-900 placeholder:text-gray-500"
                                        placeholder="متن دکمه (مثلاً: رزرو آنلاین)"
                                        value={linkText}
                                        onChange={e => setLinkText(e.target.value)}
                                    />
                                    <input
                                        className="w-full p-2 border rounded dir-ltr text-gray-900 placeholder:text-gray-500"
                                        placeholder="https://example.com"
                                        value={linkUrl}
                                        onChange={e => setLinkUrl(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={addLink} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">افزودن</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setShowLinkInput(false)} className="text-gray-600">انصراف</Button>
                                    </div>
                                </div>
                            )}

                            {/* Slider Button */}
                            <Button variant="outline" className="w-full justify-start text-gray-700 border-gray-300 hover:bg-gray-50" onClick={addSlider} disabled={elements.some(e => e.type === 'slider')}>
                                + افزودن اسلایدر لایک (😍)
                            </Button>
                        </div>

                        {/* Element List */}
                        {elements.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-gray-900">المان‌های افزوده شده:</h3>
                                {elements.map((el, i) => (
                                    <div key={i} className="flex justify-between items-center bg-gray-100 p-2 rounded text-sm text-gray-800">
                                        <span>{el.type === 'link' ? `لینک: ${el.text}` : 'اسلایدر لایک'}</span>
                                        <button onClick={() => removeElement(i)} className="text-red-600 hover:text-red-800 font-medium">حذف</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-auto flex gap-2 pt-6 border-t border-gray-100">
                            <Button variant="secondary" className="flex-1 text-gray-700 bg-gray-100 hover:bg-gray-200" onClick={() => setImageSrc(null)}>لغو</Button>
                            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleSave}>
                                ذخیره استوری
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
