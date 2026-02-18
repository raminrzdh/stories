"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import StoryBuilder from "@/components/story-builder";
import { apiRequest } from "@/lib/api";

interface Slide {
    id: number;
    image_url: string;
    thumbnail_url: string | null;
    caption_fa: string;
    sort_order: number;
    open_count: number;
}

export default function GroupDetails() {
    const { id } = useParams();
    const [slides, setSlides] = useState<Slide[]>([]);
    const [caption, setCaption] = useState("");
    const [uploading, setUploading] = useState(false);

    const fetchSlides = async () => {
        try {
            const groupBySlug = await apiRequest(`/groups/${id}`);
            if (groupBySlug) {
                setSlides(groupBySlug.slides || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSlides();
    }, [id]);

    const handleUpload = async (imageBlob: Blob) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("image", imageBlob, "story.jpg");
        formData.append("caption_fa", caption);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8080/api/groups/${id}/slides`, {
                method: "POST",
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: formData,
            });

            if (res.ok) {
                setCaption("");
                fetchSlides(); // Refresh
                alert("اسلاید با موفقیت افزوده شد");
            } else {
                alert("خطا در آپلود");
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
            await apiRequest(`/slides/${slideId}`, { method: "DELETE" });
            fetchSlides();
        } catch (err) {
            alert("خطا در حذف اسلاید");
        }
    };

    const handleEditSlide = async (slide: Slide) => {
        const newCaption = prompt("ویرایش کپشن:", slide.caption_fa);
        if (newCaption === null || newCaption === slide.caption_fa) return;

        try {
            await apiRequest(`/slides/${slide.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    caption_fa: newCaption,
                    sort_order: slide.sort_order
                }),
            });
            fetchSlides();
        } catch (err) {
            alert("خطا در ویرایش اسلاید");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">مدیریت اسلایدها</h1>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Builder */}
                <Card>
                    <CardHeader>
                        <CardTitle>افزودن اسلاید جدید</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="کپشن (اختیاری)..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        />
                        <StoryBuilder onUpload={handleUpload} />
                        {uploading && <p className="text-sm text-blue-600 animate-pulse">در حال آپلود...</p>}
                    </CardContent>
                </Card>

                {/* List */}
                <Card>
                    <CardHeader>
                        <CardTitle>اسلایدهای موجود</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {slides.length === 0 ? (
                            <p className="text-gray-500 text-sm">هنوز هیچ اسلایدی اضافه نشده است.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {slides.map(slide => (
                                    <div key={slide.id} className="relative group rounded-md overflow-hidden border">
                                        <img
                                            src={`http://localhost:8080${slide.image_url}`}
                                            className="w-full aspect-[9/16] object-cover"
                                        />

                                        {/* Hover Overlay with Caption */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center p-2 gap-3">
                                            <p className="text-white text-xs text-center line-clamp-3">
                                                {slide.caption_fa || "(بدون کپشن)"}
                                            </p>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="h-8 w-8 rounded-full"
                                                    onClick={() => handleEditSlide(slide)}
                                                    title="ویرایش"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    className="h-8 w-8 rounded-full"
                                                    onClick={() => handleDeleteSlide(slide.id)}
                                                    title="حذف"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] py-1 text-center backdrop-blur-sm">
                                            بازدید: {slide.open_count}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
