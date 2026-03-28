import React from 'react';
import { Bell, ShoppingCart, Search, Home, LayoutGrid, FileText, ShoppingBag, User, Plus } from 'lucide-react';

export default function HomeScreenAndroid() {
  return (
    <div dir="rtl" className="relative max-w-sm mx-auto min-h-screen bg-[#F7F9FC] text-[#1A202C] pb-24 overflow-x-hidden font-['Roboto'] system-ui">
      {/* Header - Android Style (less top padding) */}
      <header className="px-4 pt-6 pb-3 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[#718096] text-xs font-medium uppercase tracking-wide">مرحباً</p>
            <h1 className="text-xl font-medium">أحمد 👋</h1>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-[#4A5568] hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell size={24} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#F5A623] border-2 border-white rounded-full"></span>
            </button>
            <button className="p-2 text-[#4A5568] hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingCart size={24} />
            </button>
          </div>
        </div>
        
        {/* Search - Android Style */}
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="text-[#718096]" size={20} />
          </div>
          <input
            type="text"
            className="w-full bg-[#F1F3F4] rounded-full py-3 pr-10 pl-4 text-base focus:outline-none focus:ring-2 focus:ring-[#1A9E6E] border-none placeholder-[#718096]"
            placeholder="ابحث عن دواء أو منتج..."
          />
        </div>
      </header>

      <main className="px-4 pt-4 space-y-6">
        {/* Promo Banner - Material Card */}
        <div className="bg-gradient-to-r from-[#1A9E6E] to-[#0D7A54] rounded-xl p-5 text-white shadow-md relative overflow-hidden /* Material ripple effect */">
          <div className="relative z-10 w-2/3">
            <span className="inline-block bg-[#F5A623] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2">عرض خاص</span>
            <h2 className="text-xl font-medium mb-1 leading-tight">خصم 20% على مستلزمات السكر</h2>
            <p className="text-sm opacity-90 mb-4 font-normal">استخدم كود: SUGAR20</p>
            <button className="bg-white text-[#1A9E6E] text-sm font-medium py-2 px-5 rounded-full uppercase tracking-wide shadow-sm hover:bg-gray-50 transition-colors">
              تسوق الآن
            </button>
          </div>
          <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute -left-8 top-0 w-24 h-24 bg-[#F5A623] opacity-20 rounded-full blur-xl"></div>
        </div>

        {/* Categories */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-lg text-gray-900">الأقسام</h3>
            <button className="text-[#1A9E6E] text-sm font-medium uppercase tracking-wide">الكل</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {[
              { icon: '💊', name: 'أدوية' },
              { icon: '🩺', name: 'مستلزمات' },
              { icon: '💄', name: 'تجميل' },
              { icon: '🌿', name: 'أعشاب' },
              { icon: '👶', name: 'أطفال' },
              { icon: '💪', name: 'رياضة' }
            ].map((cat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 min-w-[70px]">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl shadow-[0_2px_4px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] /* Material ripple effect */ hover:bg-gray-50 cursor-pointer transition-colors">
                  {cat.icon}
                </div>
                <span className="text-xs text-[#4A5568] font-medium">{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Daily Offers */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-lg text-gray-900">عروض اليوم</h3>
            <button className="text-[#1A9E6E] text-sm font-medium uppercase tracking-wide">عرض الكل</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'باراسيتامول 500mg', brand: 'بانادول', price: '12.99', color: 'bg-blue-100' },
              { name: 'فيتامين د3', brand: 'بيورتس', price: '45.00', color: 'bg-yellow-100' },
              { name: 'كريم الصحة', brand: 'نيفيا', price: '28.50', color: 'bg-blue-50' },
              { name: 'شراب السعال', brand: 'أكتيفيد', price: '22.00', color: 'bg-red-50' }
            ].map((prod, i) => (
              <div key={i} className="bg-white rounded-xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] flex flex-col h-full relative /* Material ripple effect */">
                <button className="absolute top-2 left-2 p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </button>
                <div className={`w-full h-24 ${prod.color} rounded-lg mb-3 flex items-center justify-center`}>
                  <img src={`https://placehold.co/100x100/transparent/transparent`} alt={prod.name} className="w-16 h-16 object-contain mix-blend-multiply opacity-50" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] text-[#718096] font-medium block mb-0.5 uppercase tracking-wide">{prod.brand}</span>
                  <h4 className="font-medium text-sm text-[#1A202C] leading-tight mb-2 line-clamp-2">{prod.name}</h4>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="font-bold text-[#1A9E6E] text-base">{prod.price} <span className="text-[10px] font-medium">ر.س</span></div>
                  {/* Plus button removed, added FAB instead for global add action, or keep it subtle */}
                  <button className="bg-[#E8F5E9] text-[#1A9E6E] p-1.5 rounded-full flex items-center justify-center hover:bg-[#C8E6C9] transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Material FAB */}
      <button className="fixed bottom-[88px] right-4 w-14 h-14 bg-[#1A9E6E] text-white rounded-full shadow-[0_3px_5px_-1px_rgba(0,0,0,0.2),0_6px_10px_0_rgba(0,0,0,0.14),0_1px_18px_0_rgba(0,0,0,0.12)] flex items-center justify-center hover:bg-[#158059] transition-colors z-40 /* Material ripple effect */">
        <Plus size={24} />
      </button>

      {/* Material 3 Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-[#F3EDF7] bg-opacity-90 backdrop-blur-md border-t border-gray-200/50 px-2 py-2 flex justify-around items-center z-50 h-20 pb-safe-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <button className="flex flex-col items-center justify-center w-16 h-full gap-1">
          <div className="w-16 h-8 bg-[#C2E7D9] rounded-full flex items-center justify-center transition-all /* Active indicator */">
            <Home size={24} className="fill-[#0D7A54] text-[#0D7A54]" />
          </div>
          <span className="text-[11px] font-medium text-[#1D192B]">الرئيسية</span>
        </button>
        
        <button className="flex flex-col items-center justify-center w-16 h-full gap-1 hover:bg-black/5 rounded-xl transition-colors">
          <div className="w-16 h-8 flex items-center justify-center">
            <LayoutGrid size={24} className="text-[#49454F]" />
          </div>
          <span className="text-[11px] font-medium text-[#49454F]">تصفح</span>
        </button>
        
        <button className="flex flex-col items-center justify-center w-16 h-full gap-1 hover:bg-black/5 rounded-xl transition-colors">
          <div className="w-16 h-8 flex items-center justify-center">
            <FileText size={24} className="text-[#49454F]" />
          </div>
          <span className="text-[11px] font-medium text-[#49454F]">وصفتي</span>
        </button>
        
        <button className="flex flex-col items-center justify-center w-16 h-full gap-1 hover:bg-black/5 rounded-xl transition-colors relative">
          <div className="w-16 h-8 flex items-center justify-center relative">
            <ShoppingBag size={24} className="text-[#49454F]" />
            <span className="absolute top-0 right-3 bg-[#B3261E] text-white text-[10px] font-medium w-4 h-4 flex items-center justify-center rounded-full">3</span>
          </div>
          <span className="text-[11px] font-medium text-[#49454F]">سلة</span>
        </button>
        
        <button className="flex flex-col items-center justify-center w-16 h-full gap-1 hover:bg-black/5 rounded-xl transition-colors">
          <div className="w-16 h-8 flex items-center justify-center">
            <User size={24} className="text-[#49454F]" />
          </div>
          <span className="text-[11px] font-medium text-[#49454F]">حسابي</span>
        </button>
      </nav>
    </div>
  );
}
