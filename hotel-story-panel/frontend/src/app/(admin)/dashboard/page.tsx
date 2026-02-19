"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Eye, Loader2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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
            setIsDialogOpen(false);
            fetchGroups();
        } catch (err) {
            alert("خطا در ایجاد گروه");
        } finally {
            setCreating(false);
        }
    };

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            // Optimistic update
            setGroups(groups.map(g => g.id === id ? { ...g, active: !currentStatus } : g));

            await apiRequest(`/groups/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ active: !currentStatus }),
            });
        } catch (err) {
            console.error(err);
            alert("خطا در تغییر وضعیت");
            // Revert optimistic update on error
            setGroups(groups.map(g => g.id === id ? { ...g, active: currentStatus } : g));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">داشبورد کمپین‌ها</h1>
                    <p className="text-gray-500 mt-2">مدیریت استوری‌ها و وضعیت نمایش آن‌ها در شهرها</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100 transition-all hover:scale-105">
                            <PlusCircle className="ml-2 h-4 w-4" />
                            گروه استوری جدید
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>ایجاد گروه استوری جدید</DialogTitle>
                            <DialogDescription>
                                برای ایجاد یک دسته استوری جدید، نام شهر و عنوان فارسی آن را وارد کنید.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateGroup} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">اسلاگ شهر (انگلیسی یا فارسی)</Label>
                                <Input
                                    placeholder="tehran یا تهران"
                                    className="bg-white border-gray-300 focus:border-red-500 text-gray-900"
                                    value={newCity}
                                    onChange={(e) => setNewCity(e.target.value)}
                                    required
                                />
                                <p className="text-[11px] text-gray-500">لینک صفحه: /رزرو-هتل/{newCity || 'slug'}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">عنوان نمایشی (فارسی)</Label>
                                <Input
                                    placeholder="مثلاً: تخفیف‌های نوروزی 1404"
                                    className="bg-white border-gray-300 focus:border-red-500 text-gray-900"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={creating}>
                                    {creating ? <Loader2 className="animate-spin ml-2" /> : <PlusCircle className="ml-2" />}
                                    ایجاد گروه
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="h-10 w-10 animate-spin mb-4" />
                        <p>در حال بارگذاری اطلاعات...</p>
                    </div>
                ) : groups?.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PlusCircle className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">هیچ گروهی یافت نشد</h3>
                        <p className="text-gray-500 mt-2">اولین گروه استوری خود را ایجاد کنید</p>
                    </div>
                ) : (
                    groups.map((group) => (
                        <Card key={group.id} className="group hover:shadow-xl transition-all duration-300 border-gray-100 overflow-hidden bg-white">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 border-b border-gray-50 bg-gray-50/30">
                                <div className="space-y-1">
                                    <div className="text-xs text-gray-400 font-mono tracking-wider">#{group.id}</div>
                                    <CardTitle className="text-base font-bold text-gray-800 line-clamp-1 group-hover:text-red-600 transition-colors">
                                        {group.title_fa}
                                    </CardTitle>
                                </div>
                                <Link href={`/dashboard/group/${group.id}/report`}>
                                    <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 cursor-pointer group/icon transition-colors" title="مشاهده گزارش">
                                        <BarChart2 className="h-4 w-4 text-gray-400 group-hover/icon:text-blue-600 transition-colors" />
                                    </div>
                                </Link>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded px-2 py-1 font-mono dir-ltr text-right truncate">
                                    /hotel-booking/{group.city_slug}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">تعداد بازدید:</span>
                                    <span className="font-bold text-gray-900">{group.view_count.toLocaleString('fa-IR')}</span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-t border-b border-dashed border-gray-100">
                                    <Label htmlFor={`status-${group.id}`} className="text-sm text-gray-600 cursor-pointer">
                                        وضعیت انتشار
                                    </Label>
                                    <Switch
                                        id={`status-${group.id}`}
                                        checked={group.active}
                                        onCheckedChange={() => toggleStatus(group.id, group.active)}
                                    />
                                </div>

                                <Link href={`/dashboard/group/${group.id}`} className="block mt-4">
                                    <Button className="w-full justify-center bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-100 transition-all hover:shadow-lg hover:-translate-y-0.5">
                                        مدیریت اسلایدها
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

// Icon import helper
import { ArrowLeft, BarChart2 } from "lucide-react";
