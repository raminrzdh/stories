"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Lock, Mail, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            localStorage.setItem("token", data.token);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "خطا در ورود");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600">
                            <Lock size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">ورود به پنل مدیریت</h1>
                        <p className="text-gray-400 text-sm font-medium mt-2">برای دسترسی به داشبورد، وارد حساب خود شوید.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-1">پست الکترونیک</label>
                                <div className="relative">
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-red-600 focus:bg-white rounded-2xl pr-12 pl-5 py-3.5 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                        placeholder="admin@trip.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-1">رمز عبور</label>
                                <div className="relative">
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-red-600 focus:bg-white rounded-2xl pr-12 pl-5 py-3.5 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm font-bold border border-red-100 animate-in fade-in duration-200">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-200 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin text-white/50" />
                            ) : (
                                "ورود به سیستم"
                            )}
                        </button>
                    </form>
                </div>

                <div className="p-6 bg-gray-50 text-center border-t border-gray-100">
                    <Link href="/" className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors">
                        بازگشت به صفحه اصلی
                    </Link>
                </div>
            </div>
        </div>
    );
}
