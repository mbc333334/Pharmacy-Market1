import React from 'react';
import { ArrowRight, Trash2, Tag, ArrowLeft, Home, LayoutGrid, FileText, ShoppingBag, User } from 'lucide-react';

export default function CartScreen() {
  return (
    <div dir="rtl" className="relative max-w-sm mx-auto min-h-screen bg-[#F7F9FC] text-[#1A202C] pb-24 overflow-x-hidden font-sans flex flex-col">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button className="p-2 text-[#4A5568] -ml-2">
            <ArrowRight size={20} />
          </button>
          <div className="flex-1 flex items-center gap-2">
            <h1 className="text-lg font-bold">سلة التسوق</h1>
            <span className="bg-gray-100 text-[#4A5568] text-xs font-medium px-2 py-0.5 rounded-full">(3 منتجات)</span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pt-4 space-y-6">
        {/* Cart Items */}
        <div className="space-y-4">
          {[
            { name: 'باراسيتامول 500mg', variant: '24 قرص', price: '12.99', qty: 2, color: 'bg-blue-100' },
            { name: 'فيتامين ج 1000mg', variant: 'فوار بنكهة البرتقال', price: '38.00', qty: 1, color: 'bg-yellow-100' },
            { name: 'كريم ترطيب', variant: 'للبشرة الجافة', price: '28.50', qty: 1, color: 'bg-teal-50' }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-4 relative">
              <div className={`w-20 h-20 ${item.color} rounded-xl flex-shrink-0 flex items-center justify-center`}>
                <img src={`https://placehold.co/80x80/transparent/transparent`} alt={item.name} className="w-12 h-12 object-contain mix-blend-multiply opacity-50" />
              </div>
              
              <div className="flex-1 flex flex-col py-0.5">
                <div className="flex justify-between items-start">
                  <div className="pr-1">
                    <h4 className="font-bold text-sm text-[#1A202C] leading-tight">{item.name}</h4>
                    <span className="text-[11px] text-[#718096]">{item.variant}</span>
                  </div>
                  <button className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex items-end justify-between mt-auto">
                  <div className="font-bold text-[#1A9E6E] text-sm">{(parseFloat(item.price) * item.qty).toFixed(2)} <span className="text-[10px]">ر.س</span></div>
                  
                  <div className="flex items-center gap-3 bg-[#F7F9FC] px-1 rounded-lg border border-gray-100">
                    <button className="w-7 h-7 flex items-center justify-center text-[#1A9E6E] font-bold text-lg">-</button>
                    <span className="font-bold text-sm min-w-[12px] text-center">{item.qty}</span>
                    <button className="w-7 h-7 flex items-center justify-center text-[#1A9E6E] font-bold text-lg">+</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Promo Code */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Tag className="text-[#1A9E6E]" size={16} />
            </div>
            <input
              type="text"
              placeholder="أدخل كود الخصم"
              className="w-full bg-[#F7F9FC] rounded-xl py-2.5 pr-9 pl-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A9E6E] border border-gray-100"
            />
          </div>
          <button className="bg-[#1A202C] text-white px-5 rounded-xl text-sm font-bold hover:bg-black transition-colors">
            تطبيق
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
          <h3 className="font-bold text-sm border-b border-gray-100 pb-2 mb-3">ملخص الطلب</h3>
          <div className="flex justify-between text-sm text-[#4A5568]">
            <span>المجموع الفرعي</span>
            <span className="font-medium">92.48 ر.س</span>
          </div>
          <div className="flex justify-between text-sm text-[#4A5568]">
            <span>رسوم الشحن</span>
            <span className="font-medium">15.00 ر.س</span>
          </div>
          <div className="flex justify-between text-sm text-[#1A9E6E]">
            <span>الخصم (SUGAR20)</span>
            <span className="font-medium">-18.50 ر.س</span>
          </div>
          <div className="pt-3 border-t border-dashed border-gray-200 mt-1 flex justify-between items-center">
            <span className="font-bold text-base">الإجمالي</span>
            <div className="text-left">
              <span className="font-black text-xl text-[#1A202C]">88.98 <span className="text-sm font-bold text-[#4A5568]">ر.س</span></span>
              <p className="text-[10px] text-[#718096]">شامل ضريبة القيمة المضافة</p>
            </div>
          </div>
        </div>
      </main>

      {/* Checkout Button - Fixed above nav */}
      <div className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-full max-w-sm px-5 py-4 bg-white/80 backdrop-blur-md z-40">
        <button className="w-full bg-[#1A9E6E] text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 hover:bg-[#158059] transition-colors">
          إتمام الطلب <ArrowLeft size={18} />
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 rounded-t-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.03)] pb-safe-bottom">
        <button className="flex flex-col items-center gap-1 text-[#718096]">
          <Home size={22} />
          <span className="text-[10px] font-medium">الرئيسية</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#718096]">
          <LayoutGrid size={22} />
          <span className="text-[10px] font-medium">تصفح</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#718096]">
          <FileText size={22} />
          <span className="text-[10px] font-medium">وصفتي</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#1A9E6E] relative">
          <ShoppingBag size={22} className="fill-[#1A9E6E] bg-green-50 p-1 rounded-lg w-10 h-8" />
          <span className="absolute -top-1 -right-1 bg-[#F5A623] text-white text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">3</span>
          <span className="text-[10px] font-bold">سلة</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#718096]">
          <User size={22} />
          <span className="text-[10px] font-medium">حسابي</span>
        </button>
      </nav>
    </div>
  );
}
