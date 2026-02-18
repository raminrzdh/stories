"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";

interface StoryGroup {
    id: number;
    city_slug: string;
    title_fa: string;
    active: boolean;
    view_count: number;
    created_at: string;
}

export default function Dashboard() {
    const [groups, setGroups] = useState<StoryGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCity, setNewCity] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [creating, setCreating] = useState(false);

    const fetchGroups = async () => {
        try {
            const data = await apiRequest("/groups");
            setGroups(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCity || !newTitle) return;

        setCreating(true);
        try {
            await apiRequest("/groups", {
                method: "POST",
                body: JSON.stringify({
                    city_slug: newCity,
                    title_fa: newTitle,
                }),
            });
            setNewCity("");
            setNewTitle("");
            fetchGroups();
        } catch (err) {
            alert("خطا در ایجاد گروه");
        } finally {
            setCreating(false);
        }
    };

    const toggleStatus = async (id: number, currentStatus: boolean, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation if inside Link (it's not, but good practice)
        try {
            await apiRequest(`/groups/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ active: !currentStatus }),
            });
            // Optimistic update or refresh
            setGroups(groups.map(g => g.id === id ? { ...g, active: !currentStatus } : g));
        } catch (err) {
            console.error(err);
            alert("خطا در تغییر وضعیت");
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-800">ایجاد گروه استوری جدید</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateGroup} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-1/3 space-y-2">
                            <Label className="text-gray-600">اسلاگ شهر (انگلیسی یا فارسی)</Label>
                            <Input
                                placeholder="tehran یا تهران"
                                className="bg-white border-gray-200 focus:border-red-500 focus:ring-red-200"
                                value={newCity}
                                onChange={(e) => setNewCity(e.target.value)}
                                required
                            />
                            <p className="text-[10px] text-gray-400">برای آدرس‌دهی استفاده می‌شود (مثلاً: /رزرو-هتل/تهران)</p>
                        </div>
                        <div className="w-full md:w-1/3 space-y-2">
                            <Label className="text-gray-600">عنوان (فارسی)</Label>
                            <Input
                                placeholder="تخفیف‌های نوروزی"
                                className="bg-white border-gray-200 focus:border-red-500 focus:ring-red-200"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="w-full md:w-1/3">
                            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all" disabled={creating}>
                                {creating ? <Loader2 className="animate-spin ml-2" /> : <PlusCircle className="ml-2" />}
                                ایجاد گروه
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p className="col-span-full text-center py-10 text-gray-500 animate-pulse">در حال بارگذاری...</p>
                ) : groups?.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-400 text-lg">هنوز هیچ گروه استوری ایجاد نشده است.</p>
                    </div>
                ) : (
                    groups.map((group) => (
                        <Card key={group.id} className="group hover:shadow-xl transition-all duration-300 border-gray-100 overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50/50">
                                <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-red-600 transition-colors">
                                    {group.title_fa}
                                </CardTitle>
                                <div className="flex items-center text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm">
                                    <Eye className="h-3 w-3 ml-1 text-blue-500" />
                                    {group.view_count.toLocaleString('fa-IR')} بازدید
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-xs text-gray-400 mb-4 font-mono dir-ltr text-right truncate bg-gray-50 p-2 rounded">
                                    /hotel-booking/{group.city_slug}
                                </div>
                                <div className="flex justify-between items-center gap-2">
                                    <button
                                        onClick={(e) => toggleStatus(group.id, group.active, e)}
                                        className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 font-medium ${group.active
                                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${group.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                            {group.active ? 'فعال' : 'پیش‌نویس'}
                                        </div>
                                    </button>
                                    <Link href={`/dashboard/group/${group.id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full hover:border-red-200 hover:text-red-700 hover:bg-red-50">
                                            مدیریت اسلایدها
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
