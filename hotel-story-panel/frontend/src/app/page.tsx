"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Calendar, Users, Building2, Plane, Bus, Train } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


const CITIES = [
  { name: "تهران", slug: "tehran" },
  { name: "شیراز", slug: "shiraz" },
  { name: "مشهد", slug: "mashhad" },
  { name: "اصفهان", slug: "isfahan" },
  { name: "کیش", slug: "kish" },
  { name: "تبریز", slug: "tabriz" },
  { name: "یزد", slug: "yazd" },
  { name: "قشم", slug: "qeshm" },
];

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("hotel");
  const [destination, setDestination] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "hotel" && destination) {
      // Find city if selected from suggestions (exact match)
      const city = CITIES.find(c => c.name === destination.trim());
      // Use the city name (Persian) as slug if found, otherwise use input value
      // The user wants: /رزرو-هتل/تهران
      const slug = city ? city.name : destination.trim();
      router.push(`/رزرو-هتل/${slug}?date_from=2026-02-18&date_to=2026-02-19&source=searchBox`); // Adding mock params as per request example
    } else {
      alert("لطفاً مقصدی را انتخاب کنید.");
    }
  };

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-estedad)] bg-gray-50">

      {/* Navbar (Mock) */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
          <span className="text-xl font-bold text-blue-900">Trip</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <Link href="#" className="hover:text-blue-600 text-blue-600">خانه</Link>
          <Link href="#" className="hover:text-blue-600">بلیط هواپیما</Link>
          <Link href="#" className="hover:text-blue-600">رزرو هتل</Link>
          <Link href="#" className="hover:text-blue-600">تور مسافرتی</Link>
        </nav>
        <div className="flex gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">پنل مدیریت</Button>
          </Link>
          <Button size="sm">ورود / ثبت‌نام</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center bg-gray-900">
        {/* Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        </div>

        {/* Search Widget Container */}
        <div className="relative z-10 w-full max-w-4xl px-4">
          <div className="text-center text-white mb-8 space-y-2">
            <h1 className="text-3xl md:text-5xl font-extrabold drop-shadow-lg">
              تجربه سفری به‌یادماندنی
            </h1>
            <p className="text-lg opacity-90">
              رزرو آنلاین هتل، بلیط هواپیما و قطار با بهترین قیمت
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b bg-gray-50/50">
              {[
                { id: 'hotel', icon: Building2, label: 'هتل' },
                { id: 'flight', icon: Plane, label: 'پرواز' },
                { id: 'train', icon: Train, label: 'قطار' },
                { id: 'bus', icon: Bus, label: 'اتوبوس' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all
                                ${activeTab === tab.id
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Form */}
            <div className="p-4 md:p-6 bg-white animate-in fade-in slide-in-from-bottom-2 duration-300">
              {activeTab === 'hotel' ? (
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <label className="text-xs text-gray-500 mb-1 block">مقصد (شهر یا هتل)</label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-3 text-gray-400 w-5 h-5 z-10" />
                      <Input
                        placeholder="مقصد (مثلاً: تهران، شیراز)"
                        className="pr-10 h-12 text-base"
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        required
                        autoComplete="off"
                      />
                      {showSuggestions && (
                        <div className="absolute top-14 left-0 right-0 bg-white border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                          {CITIES.filter(c => c.name.includes(destination) || c.slug.includes(destination.toLowerCase())).map((city) => (
                            <div
                              key={city.slug}
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between text-sm text-gray-700"
                              onClick={() => {
                                setDestination(city.name);
                                setShowSuggestions(false);
                              }}
                            >
                              <span>{city.name}</span>
                              <span className="text-gray-400 text-xs">{city.slug}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 relative">
                    <label className="text-xs text-gray-500 mb-1 block">تاریخ اقامت</label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                      <div className="flex items-center border rounded-md h-12 pr-10 pl-3 bg-gray-50 text-gray-500 text-sm cursor-not-allowed">
                        ۵ اسفند - ۸ اسفند
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-32 relative">
                    <label className="text-xs text-gray-500 mb-1 block">مسافران</label>
                    <div className="relative">
                      <Users className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                      <div className="flex items-center border rounded-md h-12 pr-10 pl-3 bg-gray-50 text-gray-500 text-sm">
                        ۲ نفر
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end">
                    <Button type="submit" size="lg" className="w-full md:w-auto h-12 px-8 bg-orange-500 hover:bg-orange-600 text-lg shadow-md shadow-orange-200">
                      جستجو
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="h-24 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg bg-gray-50">
                  این بخش در نسخه نمایشی فعال نیست. لطفاً تب هتل را انتخاب کنید.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section (Mock) */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">مقاصد پرطرفدار</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['کیش', 'مشهد', 'اصفهان', 'شیراز'].map((city, i) => (
            <div key={city} className="aspect-[4/3] rounded-xl bg-gray-200 relative overflow-hidden group cursor-pointer">
              <img
                src={`https://source.unsplash.com/random/400x300?iran,${i}`}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                alt={city}
              />
              <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition" />
              <span className="absolute bottom-4 right-4 text-white font-bold text-lg drop-shadow-md">{city}</span>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
