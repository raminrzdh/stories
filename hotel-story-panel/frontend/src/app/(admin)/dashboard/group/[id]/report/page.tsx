"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, MousePointerClick, Calendar, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/api";

interface Slide {
    id: number;
    image_url: string;
    thumbnail_url: string | null;
    caption_fa: string;
    sort_order: number;
    open_count: number;
}

interface GroupDetails {
    id: number;
    city_slug: string;
    title_fa: string;
    active: boolean;
    view_count: number;
    created_at: string;
    slides: Slide[];
}

export default function AnalyticsReport() {
    const { id } = useParams();
    const [group, setGroup] = useState<GroupDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroupDetails = async () => {
            try {
                const data = await apiRequest(`/groups/${id}`);
                setGroup(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGroupDetails();
    }, [id]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">در حال دریافت اطلاعات...</div>;
    }

    if (!group) {
        return <div className="p-8 text-center text-red-500">گروه یافت نشد.</div>;
    }

    const totalOpens = group.slides?.reduce((acc, slide) => acc + slide.open_count, 0) || 0;
    const engagementRate = group.view_count > 0 ? ((totalOpens / group.view_count) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">گزارش عملکرد کمپین</h1>
                    <p className="text-gray-500 text-sm mt-1">{group.title_fa} ({group.city_slug})</p>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">بازدید کل (Visits)</CardTitle>
                        <Eye className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{group.view_count.toLocaleString('fa-IR')}</div>
                        <p className="text-xs text-gray-500 mt-1">تعداد دفعات مشاهده گروه در نتایج جستجو</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">کل باز شدن‌ها (Opens)</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{totalOpens.toLocaleString('fa-IR')}</div>
                        <p className="text-xs text-gray-500 mt-1">مجموع دفعات باز شدن اسلایدها</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">نرخ تعامل (Engagement)</CardTitle>
                        <BarChart2 className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">٪{Number(engagementRate).toLocaleString('fa-IR')}</div>
                        <p className="text-xs text-gray-500 mt-1">نسبت باز شدن اسلایدها به بازدید کل</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-gray-900">آمار به تفکیک اسلاید</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px] text-right">تصویر</TableHead>
                                <TableHead className="text-right">کپشن</TableHead>
                                <TableHead className="text-right">تعداد بازدید (Impressions)</TableHead>
                                <TableHead className="text-right">تاریخ ایجاد</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {group.slides?.map((slide) => (
                                <TableRow key={slide.id}>
                                    <TableCell className="font-medium">
                                        <div className="w-12 h-12 rounded-md overflow-hidden border">
                                            <img
                                                src={`http://localhost:8080${slide.thumbnail_url || slide.image_url}`}
                                                alt="Slide"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-700 max-w-[200px] truncate">
                                        {slide.caption_fa || "(بدون کپشن)"}
                                    </TableCell>
                                    <TableCell className="text-gray-900 font-bold">
                                        {slide.open_count.toLocaleString('fa-IR')}
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">
                                        -
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!group.slides || group.slides.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                        هیچ اسلایدی یافت نشد.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
