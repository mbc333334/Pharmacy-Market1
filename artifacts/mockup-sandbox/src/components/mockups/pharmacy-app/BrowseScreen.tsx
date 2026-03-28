import React from 'react';
import { Search, SlidersHorizontal, ArrowRight, Home, LayoutGrid, FileText, ShoppingBag, User, Plus } from 'lucide-react';

export default function BrowseScreen() {
  return (
    <div dir="rtl" className="relative max-w-sm mx-auto min-h-screen bg-[#F7F9FC] text-[#1A202C] pb-24 overflow-x-hidden font-sans">
      {/* Header */}
      <header className="px-5 pt-12 pb-3 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <button className="p-2 text-[#4A5568]">
            <ArrowRight size={20} />
          </button>
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="text-[#718096]" size={18} />
            </div>
            <input
              type="text"
              defaultValue="باراسيتامول"
              className="w-full bg-[#F7F9FC] rounded-xl py-2.5 pr-10 pl-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#1A9E6E] border border-gray-200"
            />
          </div>
          <button className="p-2.5 bg-[#F7F9FC] text-[#4A5568] rounded-xl border border-gray-200">
            <SlidersHorizontal size={18} />
          </button>
        </div>
        
        <div className="flex justify-between items-center mb-1">
          <h2 className="font-bold text-sm">نتائج: باراسيتامول <span className="text-[#718096] font-normal text-xs">(12 نتيجة)</span></h2>
        </div>
      </header>

      {/* Filter Chips */}
      <div className="bg-white py-3 border-b border-gray-100 sticky top-[120px] z-10">
        <div className="flex gap-2 overflow-x-auto pb-1 px-5 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {['الكل', 'مسكنات', 'أدوية قلب', 'فيتامينات', 'منظمات سكر'].map((filter, i) => (
            <button 
              key={i} 
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium border ${
                i === 0 
                  ? 'bg-[#1A9E6E] text-white border-[#1A9E6E]' 
                  : 'bg-white text-[#4A5568] border-gray-200 hover:border-gray-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <main className="px-5 pt-4 space-y-3">
        {/* Product List */}
        {[
          { name: 'باراسيتامول 500mg', brand: 'بانادول', price: '12.99', oldPrice: '', desc: 'مسكن للآلام وخافض للحرارة - 24 قرص', color: 'bg-blue-100', inStock: true },
          { name: 'باراسيتامول اكسترا', brand: 'بانادول', price: '15.50', oldPrice: '18.00', desc: 'مسكن قوي وفعال للصداع النصفي - 24 قرص', color: 'bg-red-100', inStock: true },
          { name: 'باراسيتامول للأطفال', brand: 'أدول', price: '9.00', oldPrice: '', desc: 'شراب خافض للحرارة بنكهة الفراولة - 100 مل', color: 'bg-pink-100', inStock: true },
          { name: 'أقراص باراسيتامول 500mg', brand: 'فيفادول', price: '8.50', oldPrice: '', desc: 'مسكن آلام فعال - 20 قرص', color: 'bg-blue-50', inStock: false },
          { name: 'تحاميل باراسيتامول', brand: 'أدول', price: '11.00', oldPrice: '', desc: 'تحاميل للأطفال 125mg - 10 تحاميل', color: 'bg-orange-50', inStock: true },
        ].map((prod, i) => (
          <div key={i} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-4 relative overflow-hidden">
            <div className={`w-24 h-24 ${prod.color} rounded-xl flex-shrink-0 flex items-center justify-center relative`}>
              <img src={`https://placehold.co/100x100/transparent/transparent`} alt={prod.name} className="w-16 h-16 object-contain mix-blend-multiply opacity-50" />
              {prod.oldPrice && (
                <span className="absolute top-0 right-0 bg-[#F5A623] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg rounded-tr-xl">
                  خصم
                </span>
              )}
            </div>
            
            <div className="flex-1 flex flex-col py-1">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <span className="text-[10px] text-[#718096] font-medium">{prod.brand}</span>
                  <h4 className="font-bold text-sm text-[#1A202C] leading-tight">{prod.name}</h4>
                </div>
                {prod.inStock ? (
                  <span className="text-[9px] bg-green-50 text-[#1A9E6E] px-1.5 py-0.5 rounded text-center min-w-[36px]">متوفر</span>
                ) : (
                  <span className="text-[9px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded text-center min-w-[36px]">نفذ</span>
                )}
              </div>
              
              <p className="text-[11px] text-[#4A5568] mb-2 line-clamp-2">{prod.desc}</p>
              
              <div className="flex items-end justify-between mt-auto">
                <div className="flex flex-col">
                  {prod.oldPrice && <span className="text-[10px] text-[#718096] line-through">{prod.oldPrice} ر.س</span>}
                  <div className="font-bold text-[#1A9E6E] text-sm">{prod.price} <span className="text-[10px]">ر.س</span></div>
                </div>
                <button 
                  disabled={!prod.inStock}
                  className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                    prod.inStock 
                      ? 'bg-[#1A9E6E] text-white hover:bg-[#158059]' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-[88px] right-5 bg-[#1A202C] text-white shadow-lg rounded-full px-4 py-2.5 flex items-center gap-2 z-20">
        <SlidersHorizontal size={16} />
        <span className="text-sm font-bold">فرز</span>
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 rounded-t-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.03)] pb-safe-bottom">
        <button className="flex flex-col items-center gap-1 text-[#718096]">
          <Home size={22} />
          <span className="text-[10px] font-medium">الرئيسية</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#1A9E6E]">
          <LayoutGrid size={22} className="fill-[#1A9E6E] bg-green-50 p-1 rounded-lg w-10 h-8" />
          <span className="text-[10px] font-bold">تصفح</span>
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
