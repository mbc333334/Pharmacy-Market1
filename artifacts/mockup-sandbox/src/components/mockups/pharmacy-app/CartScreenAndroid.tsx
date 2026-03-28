import React from 'react';
import { ArrowRight, Trash2, Tag, Home, LayoutGrid, FileText, ShoppingBag, User, MoreVertical } from 'lucide-react';

export default function CartScreenAndroid() {
  return (
    <div dir="rtl" className="relative max-w-sm mx-auto min-h-screen bg-[#F7F9FC] text-[#1A202C] pb-24 overflow-x-hidden font-['Roboto'] system-ui flex flex-col">
      {/* Top App Bar - Android Style */}
      <header className="bg-white px-2 pt-6 pb-2 shadow-sm sticky top-0 z-10 flex items-center">
        <button className="p-3 text-gray-700 hover:bg-gray-100 rounded-full transition-colors /* Material ripple effect */">
          <ArrowRight size={24} />
        </button>
        <div className="flex-1 flex items-center gap-2 px-2">
          <h1 className="text-xl font-medium text-gray-900">سلة التسوق</h1>
          <span className="bg-gray-100 text-[#4A5568] text-xs font-medium px-2 py-0.5 rounded-full">(3)</span>
        </div>
        <button className="p-3 text-gray-700 hover:bg-gray-100 rounded-full transition-colors /* Material ripple effect */">
          <MoreVertical size={24} />
        </button>
      </header>

      <main className="flex-1 px-4 pt-4 space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {[
            { name: 'باراسيتامول 500mg', variant: '24 قرص', price: '12.99', qty: 2, color: 'bg-blue-100' },
            { name: 'فيتامين ج 1000mg', variant: 'فوار بنكهة البرتقال', price: '38.00', qty: 1, color: 'bg-yellow-100' },
            { name: 'كريم ترطيب', variant: 'للبشرة الجافة', price: '28.50', qty: 1, color: 'bg-teal-50' }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.12)] flex gap-4 relative">
              <div className={`w-20 h-20 ${item.color} rounded-lg flex-shrink-0 flex items-center justify-center`}>
                <img src={`https://placehold.co/80x80/transparent/transparent`} alt={item.name} className="w-12 h-12 object-contain mix-blend-multiply opacity-50" />
              </div>
              
              <div className="flex-1 flex flex-col py-0.5">
                <div className="flex justify-between items-start">
                  <div className="pr-1">
                    <h4 className="font-medium text-sm text-[#1A202C] leading-tight">{item.name}</h4>
                    <span className="text-[12px] text-[#718096]">{item.variant}</span>
                  </div>
                  <button className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 rounded-full transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="font-medium text-[#1A9E6E] text-base">{(parseFloat(item.price) * item.qty).toFixed(2)} <span className="text-[10px]">ر.س</span></div>
                  
                  <div className="flex items-center gap-1 bg-[#F1F3F4] rounded-full px-1">
                    <button className="w-8 h-8 flex items-center justify-center text-[#1A9E6E] hover:bg-gray-200 rounded-full transition-colors">-</button>
                    <span className="font-medium text-sm min-w-[20px] text-center">{item.qty}</span>
                    <button className="w-8 h-8 flex items-center justify-center text-[#1A9E6E] hover:bg-gray-200 rounded-full transition-colors">+</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Promo Code */}
        <div className="bg-white rounded-xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.12)] flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Tag className="text-[#718096]" size={18} />
            </div>
            <input
              type="text"
              placeholder="أدخل كود الخصم"
              className="w-full bg-transparent border-b-2 border-gray-200 py-2 pr-9 pl-4 text-base focus:outline-none focus:border-[#1A9E6E] transition-colors rounded-none"
            />
          </div>
          <button className="text-[#1A9E6E] px-4 font-medium uppercase tracking-wide text-sm hover:bg-[#E8F5E9] rounded-md transition-colors /* Material ripple effect */">
            تطبيق
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.12)] space-y-3 mb-2">
          <h3 className="font-medium text-base text-gray-900 mb-2">ملخص الطلب</h3>
          <div className="flex justify-between text-sm text-[#4A5568]">
            <span>المجموع الفرعي</span>
            <span className="font-medium text-gray-900">92.48 ر.س</span>
          </div>
          <div className="flex justify-between text-sm text-[#4A5568]">
            <span>رسوم الشحن</span>
            <span className="font-medium text-gray-900">15.00 ر.س</span>
          </div>
          <div className="flex justify-between text-sm text-[#1A9E6E]">
            <span>الخصم (SUGAR20)</span>
            <span className="font-medium">-18.50 ر.س</span>
          </div>
          <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="font-medium text-base text-gray-900">الإجمالي</span>
            <div className="text-left">
              <span className="font-bold text-xl text-[#1A202C]">88.98 <span className="text-sm font-medium text-[#4A5568]">ر.س</span></span>
              <p className="text-[10px] text-[#718096]">شامل ضريبة القيمة المضافة</p>
            </div>
          </div>
        </div>

        {/* Snackbar suggestion visual */}
        <div className="bg-[#323232] text-[#D1C4E9] text-sm py-3 px-4 rounded shadow-md flex justify-between items-center">
          <span>تم تطبيق كود الخصم بنجاح</span>
          <span className="text-[#1A9E6E] font-medium uppercase text-xs tracking-wider">تراجع</span>
        </div>
      </main>

      {/* Checkout Button - Fixed above nav */}
      <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 w-full max-w-sm p-4 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <button className="w-full bg-[#1A9E6E] text-white py-3 rounded-full font-medium text-base shadow-[0_2px_4px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)] hover:bg-[#158059] transition-all flex items-center justify-center gap-2 uppercase tracking-wide /* Material ripple effect */">
          إتمام الطلب
        </button>
      </div>

      {/* Material 3 Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-[#F3EDF7] border-t border-gray-200/50 px-2 py-2 flex justify-around items-center z-50 h-20 pb-safe-bottom">
        <button className="flex flex-col items-center justify-center w-16 h-full gap-1 hover:bg-black/5 rounded-xl transition-colors">
          <div className="w-16 h-8 flex items-center justify-center">
            <Home size={24} className="text-[#49454F]" />
          </div>
          <span className="text-[11px] font-medium text-[#49454F]">الرئيسية</span>
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
        
        <button className="flex flex-col items-center justify-center w-16 h-full gap-1 relative">
          <div className="w-16 h-8 bg-[#C2E7D9] rounded-full flex items-center justify-center relative">
            <ShoppingBag size={24} className="fill-[#0D7A54] text-[#0D7A54]" />
            <span className="absolute top-0 right-3 bg-[#B3261E] text-white text-[10px] font-medium w-4 h-4 flex items-center justify-center rounded-full">3</span>
          </div>
          <span className="text-[11px] font-medium text-[#1D192B]">سلة</span>
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
