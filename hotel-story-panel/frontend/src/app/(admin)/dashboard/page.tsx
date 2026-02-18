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
            <Card>
                <CardHeader>
                    <CardTitle>ایجاد گروه استوری جدید</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateGroup} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-1/3 space-y-2">
                            <Label>اسلاگ شهر (انگلیسی)</Label>
                            <Input
                                placeholder="tehran"
                                dir="ltr"
                                value={newCity}
                                onChange={(e) => setNewCity(e.target.value)}
                                required
                            />
                        </div>
                        <div className="w-full md:w-1/3 space-y-2">
                            <Label>عنوان (فارسی)</Label>
                            <Input
                                placeholder="تخفیف‌های نوروزی"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="w-full md:w-1/3">
                            <Button type="submit" className="w-full" disabled={creating}>
                                {creating ? <Loader2 className="animate-spin ml-2" /> : <PlusCircle className="ml-2" />}
                                ایجاد گروه
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p className="col-span-full text-center py-10">در حال بارگذاری...</p>
                ) : groups?.length === 0 ? (
                    <p className="col-span-full text-center py-10 text-gray-500">هیچ گروه استوری یافت نشد.</p>
                ) : (
                    groups.map((group) => (
                        <Card key={group.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-bold">{group.title_fa}</CardTitle>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Eye className="h-4 w-4 ml-1" />
                                    {group.view_count}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-gray-500 mb-4 font-mono dir-ltr text-right">
                                    /{group.city_slug}
                                </div>
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={(e) => toggleStatus(group.id, group.active, e)}
                                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${group.active ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'}`}
                                    >
                                        {group.active ? 'فعال' : 'غیرفعال'}
                                    </button>
                                    <Link href={`/dashboard/group/${group.id}`}>
                                        <Button variant="outline" size="sm">
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
