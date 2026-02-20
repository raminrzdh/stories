"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    PlusCircle,
    Search,
    MoreVertical,
    LayoutGrid,
    List,
    Filter,
    Eye,
    ArrowLeft,
    Clock,
    Plus,
    X,
    Trash2,
    Settings,
    Activity,
    Layers
} from "lucide-react";

interface StoryGroup {
    id: number;
    city_slug: string;
    title_fa: string;
    caption: string;
    cover_url: string;
    active: boolean;
    story_count?: number;
    view_count: number;
}

export default function GroupsManagement() {
    const router = useRouter();
    const [groups, setGroups] = useState<StoryGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<StoryGroup | null>(null);
    const [groupToEdit, setGroupToEdit] = useState<StoryGroup | null>(null);
    const [newGroup, setNewGroup] = useState({ city_slug: '', title_fa: '', caption: '', cover_url: '' });
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8080/api/admin/story-groups', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.removeItem('token');
                router.push('/login');
                return;
            }

            if (!res.ok) throw new Error("Failed to fetch groups");

            const data = await res.json();
            setGroups(data);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadCover = async (file: File, isEdit = false) => {
        if (!file) return;

        // 2MB Limit
        if (file.size > 2 * 1024 * 1024) {
            alert('حجم فایل نباید بیشتر از ۲ مگابایت باشد');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('image', file);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://localhost:8080/api/admin/upload');
            xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(percent);
                }
            };

            xhr.onload = () => {
                let errorMsg = 'خطا در آپلود تصویر';
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (xhr.status === 200) {
                        if (isEdit && groupToEdit) {
                            setGroupToEdit({ ...groupToEdit, cover_url: data.url });
                        } else {
                            setNewGroup({ ...newGroup, cover_url: data.url });
                        }
                        setUploading(false);
                        setUploadProgress(0);
                        resolve(data);
                        return;
                    }
                    errorMsg = data.error || errorMsg;
                } catch (e) {
                    console.error('Failed to parse upload response:', e);
                }

                setUploading(false);
                setUploadProgress(0);
                alert(errorMsg);
                reject(new Error(errorMsg));
            };

            xhr.onerror = () => {
                setUploading(false);
                setUploadProgress(0);
                alert('خطا در آپلود تصویر');
                reject(new Error('Network error'));
            };

            xhr.send(formData);
        });
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroup.cover_url) {
            alert('انتخاب تصویر کاور الزامی است');
            return;
        }

        setCreating(true);
        try {
            const res = await fetch('http://localhost:8080/api/admin/story-groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newGroup)
            });

            if (!res.ok) throw new Error("Failed to create group");

            setIsCreateModalOpen(false);
            setNewGroup({ city_slug: '', title_fa: '', caption: '', cover_url: '' });
            fetchGroups();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupToEdit || !groupToEdit.cover_url) {
            alert('انتخاب تصویر کاور الزامی است');
            return;
        }

        setUpdating(true);
        try {
            const res = await fetch(`http://localhost:8080/api/admin/story-groups/${groupToEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(groupToEdit)
            });

            if (!res.ok) throw new Error("Failed to update group");

            setIsEditModalOpen(false);
            fetchGroups();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setUpdating(false);
        }
    };

    const toggleStatus = async (group: StoryGroup) => {
        try {
            const res = await fetch(`http://localhost:8080/api/admin/story-groups/${group.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ active: !group.active })
            });
            if (res.ok) fetchGroups();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteGroup = async () => {
        if (!groupToDelete) return;
        setDeleting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/admin/story-groups/${groupToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "حذف گروه با خطا مواجه شد");
            }

            setIsDeleteModalOpen(false);
            setGroupToDelete(null);
            fetchGroups();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setDeleting(false);
        }
    };

    const filteredGroups = groups.filter(g =>
        g.title_fa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.city_slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">مدیریت استوری‌ها</h1>
                    <p className="text-sm text-slate-400 font-bold mt-1">ایجاد، ویرایش و پایش وضعیت گروه‌های استوری.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-100"
                >
                    <PlusCircle size={20} />
                    گروه جدید
                </button>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative group flex-1 max-w-md">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="جستجو در نام گروه یا شهر..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-red-100 rounded-2xl pr-12 pl-4 py-3 outline-none transition-all text-sm font-bold text-slate-900 shadow-sm hover:border-slate-300"
                    />
                </div>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-4" />
                    <p className="font-bold text-slate-500">در حال دریافت لیست گروه‌ها...</p>
                </div>
            ) : filteredGroups.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-20 border border-slate-100 border-dashed flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Search size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">موردی یافت نشد</h3>
                    <p className="text-slate-400 font-medium mt-2">هیچ گروه استوری با مشخصات وارد شده وجود ندارد.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredGroups.map((group) => (
                        <div key={group.id} className="bg-white rounded-[1.25rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group relative overflow-hidden">
                            {/* Top Status Bar */}
                            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-slate-50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {group.id}</span>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded ${group.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                        {group.active ? 'فعال' : 'غیرفعال'}
                                    </span>
                                    <button
                                        onClick={() => toggleStatus(group)}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${group.active ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${group.active ? '-translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="p-5 flex items-center gap-5 flex-1">
                                <div className="relative shrink-0">
                                    <div className={`w-20 h-20 rounded-full p-[2px] transition-all duration-500 bg-gradient-to-tr ${group.active ? 'from-yellow-400 via-red-500 to-purple-600' : 'from-slate-200 to-slate-300'}`}>
                                        <div className="w-full h-full rounded-full border-[2px] border-white overflow-hidden bg-white">
                                            <img
                                                src={group.cover_url ? `http://localhost:8080${group.cover_url}` : "/placeholder.jpg"}
                                                alt={group.title_fa}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-0.5">{group.city_slug}</div>
                                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-1 truncate">{group.title_fa}</h3>
                                    <p className="text-[11px] text-slate-400 font-bold line-clamp-2 leading-relaxed">{group.caption || 'بدون کپشن مدیریتی'}</p>
                                </div>
                            </div>

                            {/* Actions & Stats Row */}
                            <div className="px-5 pb-3">
                                <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-xl border border-slate-100/50">
                                    <div className="flex items-center">
                                        <Link
                                            href={`/dashboard/group/${group.id}/slides/new`}
                                            className="p-2 hover:bg-white text-slate-400 hover:text-red-600 rounded-xl transition-all"
                                            title="افزودن اسلاید"
                                        >
                                            <Plus size={18} />
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setGroupToDelete(group);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="p-2 hover:bg-white text-slate-400 hover:text-red-600 rounded-xl transition-all"
                                            title="حذف"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <button
                                            className="p-2 hover:bg-white text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                                            title="آمار"
                                        >
                                            <Activity size={18} />
                                        </button>
                                    </div>

                                    <div className="flex items-center px-3 border-r border-slate-200">
                                        <span className="text-[9px] font-black text-slate-400 leading-none ml-2">SLIDES:</span>
                                        <span className="text-xs font-black text-slate-900">{(group.story_count || 0).toLocaleString('fa-IR')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Primary Action Button */}
                            <div className="px-5 pb-5">
                                <button
                                    onClick={() => {
                                        setGroupToEdit(group);
                                        setIsEditModalOpen(true);
                                    }}
                                    className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                                >
                                    <Settings size={16} className="opacity-50" />
                                    <span>ویرایش گروه</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">کاور</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">اطلاعات گروه</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">استوری‌ها</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">بازدید کل</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">وضعیت</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">عملیات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredGroups.map((group) => (
                                <tr key={group.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-center">
                                        <img
                                            src={`http://localhost:8080${group.cover_url}`}
                                            className="w-12 h-12 rounded-xl object-cover mx-auto"
                                            alt=""
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-black text-slate-900">{group.title_fa}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{group.city_slug}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-black text-slate-900">{group.story_count || 0}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-black text-slate-900">{group.view_count.toLocaleString('fa-IR')}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => toggleStatus(group)}
                                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${group.active ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                            >
                                                <span
                                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${group.active ? '-translate-x-4' : 'translate-x-0'}`}
                                                />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 justify-end">
                                            <Link
                                                href={`/dashboard/group/${group.id}/slides/new`}
                                                className="p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all shadow-sm border border-slate-100"
                                                title="افزودن استوری"
                                            >
                                                <Plus size={18} />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setGroupToEdit(group);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-2 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-all shadow-sm border border-slate-100"
                                                title="ویرایش"
                                            >
                                                <Settings size={18} />
                                            </button>
                                            <button
                                                className="p-2 bg-white hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all shadow-sm border border-slate-100"
                                                title="آمار"
                                            >
                                                <Activity size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setGroupToDelete(group);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all shadow-sm border border-slate-100"
                                                title="حذف"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modals - Reusing from previous work */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/20">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-900 p-8 text-white relative">
                            <h2 className="text-2xl font-black">ایجاد گروه جدید</h2>
                            <p className="text-slate-400 text-sm font-medium mt-1">اطلاعات پایه گروه استوری را وارد کنید.</p>
                            <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateGroup} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 text-right">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">نام شهر (انگلیسی)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. tehran"
                                        value={newGroup.city_slug}
                                        onChange={(e) => setNewGroup({ ...newGroup, city_slug: e.target.value.toLowerCase() })}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-red-100 focus:bg-white rounded-2xl px-5 py-3 outline-none transition-all text-sm font-bold text-slate-900"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 text-right">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">عنوان فارسی</label>
                                    <input
                                        type="text"
                                        placeholder="تخفیف‌های ویژه"
                                        value={newGroup.title_fa}
                                        onChange={(e) => setNewGroup({ ...newGroup, title_fa: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-red-100 focus:bg-white rounded-2xl px-5 py-3 outline-none transition-all text-sm font-bold text-slate-900 text-right"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 text-right">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">مدل کپشن (زیر دایره)</label>
                                <input
                                    type="text"
                                    placeholder="مثلا: تهران"
                                    value={newGroup.caption}
                                    onChange={(e) => setNewGroup({ ...newGroup, caption: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-red-100 focus:bg-white rounded-2xl px-5 py-3 outline-none transition-all text-sm font-bold text-slate-900 text-right"
                                    required
                                />
                            </div>

                            <div className="space-y-2 text-right">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">تصویر کاور</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative">
                                        {newGroup.cover_url ? (
                                            <img src={`http://localhost:8080${newGroup.cover_url}`} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <Plus size={24} className="text-slate-300" />
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-red-600/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-2">
                                                <span className="text-[10px] font-black">{uploadProgress}%</span>
                                                <div className="w-full h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
                                                    <div className="h-full bg-white transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="cursor-pointer">
                                            <div className="bg-slate-50 hover:bg-slate-100 border border-slate-200 py-3 px-4 rounded-xl text-center text-xs font-bold text-slate-600 transition-all">
                                                انتخاب فایل تصویر
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUploadCover(e.target.files[0])} />
                                        </label>
                                        <p className="text-[10px] text-slate-400 font-medium mt-2 mr-1">فرمت‌های JPG، PNG (حداکثر ۲ مگابایت)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={creating || uploading}
                                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-red-100"
                                >
                                    {creating ? 'در حال ایجاد...' : 'ذخیره گروه'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-6 bg-slate-50 hover:bg-slate-100 text-slate-400 py-4 rounded-2xl font-bold transition-all border border-slate-100"
                                >
                                    انصراف
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && groupToEdit && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/20">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-900 p-8 text-white relative">
                            <h2 className="text-2xl font-black">ویرایش گروه</h2>
                            <p className="text-slate-400 text-sm font-medium mt-1">تغییرات مورد نظر را اعمال کنید.</p>
                            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateGroup} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 text-right">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">نام شهر (انگلیسی)</label>
                                    <input
                                        type="text"
                                        value={groupToEdit.city_slug}
                                        onChange={(e) => setGroupToEdit({ ...groupToEdit, city_slug: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-red-100 focus:bg-white rounded-2xl px-5 py-3 outline-none transition-all text-sm font-bold text-slate-900"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 text-right">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">عنوان فارسی</label>
                                    <input
                                        type="text"
                                        value={groupToEdit.title_fa}
                                        onChange={(e) => setGroupToEdit({ ...groupToEdit, title_fa: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-red-100 focus:bg-white rounded-2xl px-5 py-3 outline-none transition-all text-sm font-bold text-slate-900 text-right"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 text-right">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">مدل کپشن</label>
                                <input
                                    type="text"
                                    value={groupToEdit.caption}
                                    onChange={(e) => setGroupToEdit({ ...groupToEdit, caption: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-red-100 focus:bg-white rounded-2xl px-5 py-3 outline-none transition-all text-sm font-bold text-slate-900 text-right"
                                    required
                                />
                            </div>

                            <div className="space-y-2 text-right">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">تصویر کاور</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative">
                                        <img src={`http://localhost:8080${groupToEdit.cover_url}`} className="w-full h-full object-cover" alt="Preview" />
                                        {uploading && (
                                            <div className="absolute inset-0 bg-red-600/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-2">
                                                <span className="text-[10px] font-black">{uploadProgress}%</span>
                                                <div className="w-full h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
                                                    <div className="h-full bg-white transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="cursor-pointer">
                                            <div className="bg-slate-50 hover:bg-slate-100 border border-slate-200 py-3 px-4 rounded-xl text-center text-xs font-bold text-slate-600 transition-all">
                                                تغییر تصویر
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUploadCover(e.target.files[0], true)} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={updating || uploading}
                                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-red-100"
                                >
                                    {updating ? 'در حال بروزرسانی...' : 'بروزرسانی'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-6 bg-slate-50 hover:bg-slate-100 text-slate-400 py-4 rounded-2xl font-bold transition-all border border-slate-100"
                                >
                                    انصراف
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isDeleteModalOpen && groupToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/20">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trash2 size={32} className="text-red-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">حذف گروه استوری</h2>
                            <p className="text-slate-400 text-sm font-medium mt-2">
                                آیا از حذف گروه <strong>«{groupToDelete.title_fa}»</strong> اطمینان دارید؟ این عمل غیرقابل بازگشت است.
                            </p>
                        </div>
                        <div className="p-8 pt-0 flex gap-3">
                            <button
                                onClick={handleDeleteGroup}
                                disabled={deleting}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white py-4 rounded-2xl font-bold transition-all active:scale-95"
                            >
                                {deleting ? 'در حال حذف...' : 'بله، حذف کن'}
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-400 py-4 rounded-2xl font-bold transition-all border border-slate-100"
                            >
                                انصراف
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
