"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

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
        return null; // Or a loading spinner
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white border-l shadow-sm hidden md:flex flex-col">
                <div className="p-6 border-b flex items-center justify-center">
                    <h1 className="text-xl font-bold text-blue-600">پنل استوری</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/dashboard">
                        <Button
                            variant="ghost"
                            className={`w-full justify-start ${pathname === "/dashboard" ? "bg-gray-100 font-bold" : ""
                                }`}
                        >
                            <LayoutDashboard className="ml-2 h-4 w-4" />
                            داشبورد کمپین‌ها
                        </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start text-gray-500 cursor-not-allowed">
                        <PlusCircle className="ml-2 h-4 w-4" />
                        تنظیمات (به زودی)
                    </Button>
                </nav>
                <div className="p-4 border-t">
                    <Button variant="outline" className="w-full justify-start text-red-600" onClick={handleLogout}>
                        <LogOut className="ml-2 h-4 w-4" />
                        خروج
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-8 overflow-auto">
                <div className="md:hidden flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold text-blue-600">پنل استوری</h1>
                    <Button variant="ghost" size="icon" onClick={handleLogout}>
                        <LogOut className="h-5 w-5 text-red-600" />
                    </Button>
                </div>

                {children}
            </main>
        </div>
    );
}
