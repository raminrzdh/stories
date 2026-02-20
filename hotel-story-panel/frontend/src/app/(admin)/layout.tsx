"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Layers,
    Settings,
    LogOut,
    ChevronRight,
    Search,
    User,
    Menu,
    X,
    Calendar,
    Activity
} from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token && pathname !== "/login") {
            router.push("/login");
        } else {
            setAuthorized(true);
        }
    }, [router, pathname]);

    if (pathname === "/login") {
        return <>{children}</>;
    }

    if (!authorized) {
        return null;
    }

    const menuItems = [
        {
            title: "پیشخوان",
            icon: <LayoutDashboard size={20} />,
            href: "/dashboard",
            active: pathname === "/dashboard"
        },
        {
            title: "مدیریت استوری‌ها",
            icon: <Layers size={20} />,
            href: "/dashboard/groups",
            active: pathname.startsWith("/dashboard/groups") || pathname.includes("/group/")
        },
        {
            title: "تنظیمات",
            icon: <Settings size={20} />,
            href: "/dashboard/settings",
            active: pathname === "/dashboard/settings"
        }
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans rtl" dir="rtl">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 right-0 z-50 w-72 bg-white border-l border-slate-200 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:static`}
            >
                <div className="h-full flex flex-col">
                    {/* Header/Logo */}
                    <div className="p-8 pb-12 flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                            <Layers className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">TRIP</h1>
                            <div className="text-[10px] font-medium text-slate-400 tracking-[0.2em] uppercase leading-none">Admin Panel</div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${item.active
                                    ? 'bg-red-50 text-red-600 shadow-sm shadow-red-100/50'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className={`${item.active ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`}>
                                        {item.icon}
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">{item.title}</span>
                                </div>
                                {item.active && <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-sm shadow-red-200" />}
                            </Link>
                        ))}
                    </nav>

                    {/* Bottom Area */}
                    <div className="p-6 mt-auto">
                        <div className="bg-slate-50 rounded-3xl p-4 mb-4 border border-slate-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                                    <User size={20} className="text-slate-600" />
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-900">مدیر سیستم</div>
                                    <div className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Administrator</div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-bold rounded-xl transition-all border border-slate-200 hover:border-red-200 active:scale-95 group"
                            >
                                <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                                خروج از حساب
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden text-right">
                {/* Top Navbar */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <div className="relative group lg:block hidden">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="جستجو در بخش‌ها..."
                                className="bg-slate-50 border-2 border-transparent focus:border-red-100 focus:bg-white rounded-2xl pr-12 pl-4 py-2.5 w-64 outline-none transition-all text-sm font-medium text-slate-900 border-r-0"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-900">{new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            <span className="text-[10px] font-medium text-slate-400 leading-none mt-0.5 tracking-tight uppercase">Admin Dashboard</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8 h-full overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
