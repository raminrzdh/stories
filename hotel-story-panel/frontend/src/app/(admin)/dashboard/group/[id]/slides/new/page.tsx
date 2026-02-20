"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StoryBuilder from "@/components/story-builder";
import { ArrowRight, Loader2 } from "lucide-react";

export default function NewSlidePage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;
    const [groupName, setGroupName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchGroup();
    }, [groupId]);

    const fetchGroup = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/admin/story-groups/${groupId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                localStorage.removeItem('token');
                router.push('/login');
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setGroupName(data.title_fa);
            }
        } catch (error) {
            console.error('Fetch group error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (file: Blob | null, elements: any[], duration: number, backgroundColor: string | null) => {
        const formData = new FormData();
        if (file) {
            formData.append("image", file, "story.jpg");
        }
        formData.append("elements", JSON.stringify(elements));
        formData.append("duration", duration.toString());
        if (backgroundColor) {
            formData.append("background_color", backgroundColor);
        }

        try {
            const res = await fetch(`http://localhost:8080/api/admin/story-groups/${groupId}/stories`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: formData
            });

            if (res.ok) {
                router.push(`/dashboard/group/${groupId}`);
            } else {
                alert("خطا در ذخیره اسلاید");
            }
        } catch (error) {
            console.error(error);
            alert("خطای شبکه");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Minimal Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/dashboard`)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowRight className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">افزودن اسلاید جدید</h1>
                        <p className="text-xs font-medium text-gray-500">گروه: {groupName}</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-hidden relative">
                <StoryBuilder onUpload={handleUpload} />
            </main>
        </div>
    );
}
