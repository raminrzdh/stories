"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar as CalendarIcon, Users, ChevronDown, Hotel, Plane, Train, Ship, Car, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Calendar } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import PassengerPicker from "@/components/passenger-picker";
import "react-multi-date-picker/styles/layouts/mobile.css";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("hotel");
  const [destination, setDestination] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);

  // UI state for dropdowns
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassengerPicker, setShowPassengerPicker] = useState(false);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const passengerPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (passengerPickerRef.current && !passengerPickerRef.current.contains(event.target as Node)) {
        setShowPassengerPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (forcedNights?: number) => {
    const normalizedInput = destination.trim();
    const citySlug = normalizedInput || "tehran";

    // Format dates for query params (Gregorian YYYY-MM-DD)
    let dateParams = "";
    if (dateRange && Array.isArray(dateRange) && dateRange.length >= 2) {
      const start = dateRange[0].toDate();
      const end = dateRange[1].toDate();

      const format = (date: Date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [year, month, day].join('-');
      };

      // Calculate nights if not provided
      let nights = forcedNights;
      if (nights === undefined) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      dateParams = `?date_from=${format(start)}&date_to=${format(end)}&nights=${nights}`;
    }

    router.push(`/رزرو-هتل/${citySlug}${dateParams}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                H
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Trip</span>
            </div>
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              <Link href="#" className="text-red-600 font-semibold">خانه</Link>
              <Link href="#" className="text-gray-600 hover:text-red-600 transition-colors">بلیط هواپیما</Link>
              <Link href="#" className="text-gray-600 hover:text-red-600 transition-colors">رزرو هتل</Link>
              <Link href="#" className="text-gray-600 hover:text-red-600 transition-colors">تور مسافرتی</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="hidden md:flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              پنل مدیریت
            </Link>
            <button className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm active:scale-95">
              ورود یا ثبت‌نام
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[480px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-50" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-md">
            سفر رویایی‌تان را همین حالا رزرو کنید
          </h1>
          <p className="text-lg md:text-xl text-red-50 mb-12 max-w-2xl mx-auto opacity-90">
            تضمین کمترین قیمت برای بیش از ۱ میلیون هتل و پرواز در سراسر جهان
          </p>

          {/* Search Widget */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-2 md:p-3 relative z-20">
            {/* Tabs */}
            <div className="flex flex-wrap gap-1 mb-4 bg-gray-50 p-1 rounded-xl">
              {[
                { id: "hotel", icon: Hotel, label: "رزرو هتل" },
                { id: "flight", icon: Plane, label: "پرواز" },
                { id: "train", icon: Train, label: "قطار" },
                { id: "bus", icon: Car, label: "اتوبوس" },
                { id: "ship", icon: Ship, label: "کشتی" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
                    }`}
                >
                  <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="flex flex-col md:flex-row items-stretch gap-2">
              <div className="flex-1 min-w-[240px] relative">
                <div className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400">
                  <MapPin size={20} />
                </div>
                <input
                  type="text"
                  placeholder="کجا می‌روید؟ (نام شهر یا هتل)"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-14 pr-12 pl-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-600 outline-none transition-all text-gray-900 placeholder:text-gray-400 font-bold"
                />
              </div>

              <div className="flex-1 min-w-[200px] relative" ref={datePickerRef}>
                <div className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400">
                  <CalendarIcon size={20} />
                </div>
                <div
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full h-14 pr-12 pl-4 flex items-center justify-between bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <span className={`font-black transition-colors ${dateRange ? 'text-gray-900' : 'text-gray-400'}`}>
                    {dateRange && dateRange[0] ? (
                      dateRange[1] ? `${dateRange[0].format("D MMMM")} - ${dateRange[1].format("D MMMM")}`
                        : dateRange[0].format("D MMMM")
                    ) : "زمان سفر"}
                  </span>
                  <ChevronDown size={16} className={`text-gray-300 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
                </div>

                {showDatePicker && (
                  <div className="absolute top-full right-0   bg-white rounded-3xl   border border-gray-100 p-4 z-50 animate-in fade-in zoom-in duration-200 overflow-hidden min-w-[320px]">

                    <Calendar
                      range
                      value={dateRange}
                      onChange={setDateRange}
                      calendar={persian}
                      locale={persian_fa}
                      className="shamsi-calendar-custom"
                    />
                    {dateRange && dateRange[0] && dateRange[1] && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between px-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">مدت اقامت</span>
                          <span className="text-sm font-bold text-gray-900">
                            {(() => {
                              const diffTime = Math.abs(dateRange[1].toDate().getTime() - dateRange[0].toDate().getTime());
                              const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              return `${nights} شب`;
                            })()}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const diffTime = Math.abs(dateRange[1].toDate().getTime() - dateRange[0].toDate().getTime());
                            const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            handleSearch(nights);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg  transition-all active:scale-95"
                        >
                          تایید و جستجو
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-[180px] relative" ref={passengerPickerRef}>
                <div className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400">
                  <Users size={20} />
                </div>
                <div
                  onClick={() => setShowPassengerPicker(!showPassengerPicker)}
                  className="w-full h-14 pr-12 pl-4 flex items-center justify-between bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <span className={`font-bold transition-colors ${adults + childrenCount > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                    {adults} بزرگسال، {childrenCount} کودک
                  </span>
                  <ChevronDown size={16} className={`text-gray-300 transition-transform ${showPassengerPicker ? 'rotate-180' : ''}`} />
                </div>

                {showPassengerPicker && (
                  <PassengerPicker
                    adults={adults}
                    childrenCount={childrenCount}
                    onChange={(a, c) => { setAdults(a); setChildrenCount(c); }}
                    onClose={() => setShowPassengerPicker(false)}
                  />
                )}
              </div>

              <button
                onClick={() => handleSearch()}
                className="h-14 px-10 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Search size={22} />
                جستجو
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">پیشنهادات ویژه</h2>
            <p className="text-gray-500 font-medium">بهترین هتل‌ها با تخفیف‌های استثنایی</p>
          </div>
          <button className="text-red-600 font-bold hover:underline">مشاهده همه</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { city: "تهران", name: "هتل اسپیناس پالاس", price: "۴,۹۰۰,۰۰۰", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop" },
            { city: "کیش", name: "هتل ترنج", price: "۷,۲۰۰,۰۰۰", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop" },
            { city: "مشهد", name: "هتل درویشی", price: "۳,۸۰۰,۰۰۰", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop" },
          ].map((hotel, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-md bg-gray-200">
                <img
                  src={hotel.img}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">
                  {hotel.city}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors tracking-tight">{hotel.name}</h3>
              <div className="flex items-end gap-1">
                <span className="text-red-600 text-lg font-black">{hotel.price}</span>
                <span className="text-gray-400 text-xs font-medium pb-1">تومان / هر شب</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
