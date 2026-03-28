import React from 'react';
import { Package, FileText, Heart, MapPin, CreditCard, Bell, Shield, MessageCircle, Star, LogOut, ChevronLeft, Edit2, Home, LayoutGrid, ShoppingBag, User } from 'lucide-react';

export default function ProfileScreen() {
  return (
    <div dir="rtl" className="relative max-w-sm mx-auto min-h-screen bg-[#F7F9FC] text-[#1A202C] pb-24 overflow-x-hidden font-sans flex flex-col">
      {/* Header Profile Info */}
      <header className="px-5 pt-12 pb-6 bg-[#1A9E6E] text-white sticky top-0 z-10 rounded-b-[2rem] shadow-sm">
        <h1 className="text-center font-bold text-lg mb-6">حسابي</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#1A9E6E] text-2xl font-bold shadow-md">
              أح
            </div>
            <button className="absolute bottom-0 left-0 bg-[#F5A623] text-white p-1.5 rounded-full border-2 border-[#1A9E6E] shadow-sm">
              <Edit2 size={12} />
            </button>
          </div>
          
          <div className="flex-1">
            <h2 className="font-bold text-xl mb-1">أحمد محمد العمري</h2>
            <p className="text-green-100 text-sm mb-2" dir="ltr">+966 55 123 4567</p>
            <button className="bg-white/20 hover:bg-white/30 transition-colors text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
              تعديل الملف الشخصي
            </button>
          </div>
        </div>
      </header>

      <main className="px-5 pt-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 -mt-10 relative z-20">
          <div className="bg-white rounded-2xl p-3 shadow-md border border-gray-50 flex flex-col items-center justify-center gap-1">
            <span className="text-2xl font-black text-[#1A9E6E]">24</span>
            <span className="text-[11px] text-[#4A5568] font-medium">طلباتي</span>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-md border border-gray-50 flex flex-col items-center justify-center gap-1">
            <span className="text-2xl font-black text-[#1A9E6E]">8</span>
            <span className="text-[11px] text-[#4A5568] font-medium">وصفاتي</span>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-md border border-gray-50 flex flex-col items-center justify-center gap-1">
            <span className="text-2xl font-black text-[#1A9E6E]">3</span>
            <span className="text-[11px] text-[#4A5568] font-medium">عناويني</span>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-5">
          {/* Section 1: Orders & Prescriptions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="px-4 pt-4 pb-2 text-xs font-bold text-[#718096] uppercase">الطلبات والوصفات</h3>
            <div className="divide-y divide-gray-50">
              <MenuItem icon={<Package size={18} className="text-[#1A9E6E]" />} title="طلباتي السابقة" />
              <MenuItem icon={<FileText size={18} className="text-[#1A9E6E]" />} title="وصفاتي الطبية" badge="2 جديدة" />
              <MenuItem icon={<Heart size={18} className="text-red-500" />} title="قائمة المفضلة" />
            </div>
          </div>

          {/* Section 2: Account Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="px-4 pt-4 pb-2 text-xs font-bold text-[#718096] uppercase">إعدادات الحساب</h3>
            <div className="divide-y divide-gray-50">
              <MenuItem icon={<MapPin size={18} className="text-[#4A5568]" />} title="عناوين التوصيل" />
              <MenuItem icon={<CreditCard size={18} className="text-[#4A5568]" />} title="طرق الدفع" />
              <MenuItem icon={<Bell size={18} className="text-[#4A5568]" />} title="الإشعارات" />
              <MenuItem icon={<Shield size={18} className="text-[#4A5568]" />} title="الأمان والخصوصية" />
            </div>
          </div>

          {/* Section 3: Help */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="px-4 pt-4 pb-2 text-xs font-bold text-[#718096] uppercase">المساعدة</h3>
            <div className="divide-y divide-gray-50">
              <MenuItem icon={<MessageCircle size={18} className="text-[#F5A623]" />} title="تواصل معنا" />
              <MenuItem icon={<Star size={18} className="text-[#F5A623]" />} title="قيّم التطبيق" />
            </div>
          </div>
          
          {/* Logout Button */}
          <button className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-center gap-2 text-red-500 font-bold mb-6">
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </main>

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
        <button className="flex flex-col items-center gap-1 text-[#718096] relative">
          <ShoppingBag size={22} />
          <span className="absolute -top-1 -right-1 bg-[#F5A623] text-white text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">3</span>
          <span className="text-[10px] font-medium">سلة</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#1A9E6E]">
          <User size={22} className="fill-[#1A9E6E] bg-green-50 p-1 rounded-lg w-10 h-8" />
          <span className="text-[10px] font-bold">حسابي</span>
        </button>
      </nav>
    </div>
  );
}

function MenuItem({ icon, title, badge }: { icon: React.ReactNode, title: string, badge?: string }) {
  return (
    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
          {icon}
        </div>
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="bg-[#1A9E6E]/10 text-[#1A9E6E] text-[10px] font-bold px-2 py-0.5 rounded-md">
            {badge}
          </span>
        )}
        <ChevronLeft size={16} className="text-[#718096]" />
      </div>
    </button>
  );
}
