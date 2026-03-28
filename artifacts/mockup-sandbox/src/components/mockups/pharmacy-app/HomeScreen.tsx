import React from 'react';
import { Bell, ShoppingCart, Search, Home, LayoutGrid, FileText, ShoppingBag, User, Plus } from 'lucide-react';

export default function HomeScreen() {
  return (
    <div dir="rtl" className="relative max-w-sm mx-auto min-h-screen bg-[#F7F9FC] text-[#1A202C] pb-24 overflow-x-hidden font-sans">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[#718096] text-sm">مرحباً،</p>
            <h1 className="text-xl font-bold font-sans">أحمد 👋</h1>
          </div>
          <div className="flex gap-3">
            <button className="relative p-2 bg-[#F7F9FC] rounded-full text-[#4A5568]">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F5A623] rounded-full"></span>
            </button>
            <button className="relative p-2 bg-[#F7F9FC] rounded-full text-[#4A5568]">
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="text-[#718096]" size={18} />
          </div>
          <input
            type="text"
            className="w-full bg-[#F7F9FC] rounded-xl py-3 pr-10 pl-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A9E6E] border-none placeholder-[#718096]"
            placeholder="ابحث عن دواء أو منتج..."
          />
        </div>
      </header>

      <main className="px-5 pt-4 space-y-6">
        {/* Promo Banner */}
        <div className="bg-gradient-to-r from-[#1A9E6E] to-[#0D7A54] rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 w-2/3">
            <span className="inline-block bg-[#F5A623] text-white text-xs font-bold px-2 py-1 rounded-md mb-2">عرض خاص</span>
            <h2 className="text-lg font-bold mb-1 leading-tight">خصم 20% على مستلزمات السكر</h2>
            <p className="text-sm opacity-90 mb-4">استخدم كود: SUGAR20</p>
            <button className="bg-white text-[#1A9E6E] text-sm font-semibold py-2 px-4 rounded-full">
              تسوق الآن
            </button>
          </div>
          <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute -left-8 top-0 w-24 h-24 bg-[#F5A623] opacity-20 rounded-full blur-xl"></div>
        </div>

        {/* Categories */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">الأقسام</h3>
            <button className="text-[#1A9E6E] text-sm font-medium">الكل</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {[
              { icon: '💊', name: 'أدوية' },
              { icon: '🩺', name: 'مستلزمات' },
              { icon: '💄', name: 'تجميل' },
              { icon: '🌿', name: 'أعشاب' },
              { icon: '👶', name: 'أطفال' },
              { icon: '💪', name: 'رياضة' }
            ].map((cat, i) => (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[70px]">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-gray-100">
                  {cat.icon}
                </div>
                <span className="text-xs text-[#4A5568] font-medium mt-1">{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Daily Offers */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">عروض اليوم</h3>
            <button className="text-[#1A9E6E] text-sm font-medium">عرض الكل</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'باراسيتامول 500mg', brand: 'بانادول', price: '12.99', color: 'bg-blue-100' },
              { name: 'فيتامين د3', brand: 'بيورتس', price: '45.00', color: 'bg-yellow-100' },
              { name: 'كريم الصحة', brand: 'نيفيا', price: '28.50', color: 'bg-blue-50' },
              { name: 'شراب السعال', brand: 'أكتيفيد', price: '22.00', color: 'bg-red-50' }
            ].map((prod, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col h-full relative">
                <button className="absolute top-2 left-2 p-1.5 bg-gray-50 rounded-full text-gray-400 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </button>
                <div className={`w-full h-24 ${prod.color} rounded-xl mb-3 flex items-center justify-center`}>
                  <img src={`https://placehold.co/100x100/transparent/transparent`} alt={prod.name} className="w-16 h-16 object-contain mix-blend-multiply opacity-50" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-[#718096] font-medium block mb-1">{prod.brand}</span>
                  <h4 className="font-bold text-sm text-[#1A202C] leading-tight mb-2 line-clamp-2">{prod.name}</h4>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="font-bold text-[#1A9E6E] text-sm">{prod.price} <span className="text-[10px]">ر.س</span></div>
                  <button className="bg-[#1A9E6E] text-white p-1.5 rounded-lg flex items-center justify-center hover:bg-[#158059] transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 rounded-t-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.03)] pb-safe-bottom">
        <button className="flex flex-col items-center gap-1 text-[#1A9E6E]">
          <Home size={22} className="fill-[#1A9E6E] bg-green-50 p-1 rounded-lg w-10 h-8" />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#718096]">
          <LayoutGrid size={22} />
          <span className="text-[10px] font-medium">تصفح</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#718096]">
          <FileText size={22} />
          <span className="text-[10px] font-medium">وصفتي</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#718096] relative">
          <ShoppingBag size={22} />
          <span className="absolute -top-1 -right-1 bg-[#F5A623] text-white text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">3</span>
          <span className="text-[10px] font-medium">سلة</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#718096]">
          <User size={22} />
          <span className="text-[10px] font-medium">حسابي</span>
        </button>
      </nav>
    </div>
  );
}
