import React from 'react';
import { Store, FileText, MapPin, Phone, Upload, ArrowRight, Check } from 'lucide-react';

export default function PharmacyRegisterScreen() {
  return (
    <div dir="rtl" className="relative max-w-sm mx-auto min-h-screen bg-[#F7F9FC] text-[#1A202C] pb-8 overflow-x-hidden font-sans flex flex-col">
      
      {/* Header & Progress */}
      <div className="bg-white pt-12 pb-6 px-5 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-xl font-bold flex-1">تسجيل صيدلية جديدة</h1>
        </div>
        
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-100 -z-10"></div>
          <div className="absolute right-0 w-1/2 top-1/2 -translate-y-1/2 h-0.5 bg-[#1A9E6E] -z-10 transition-all"></div>
          
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-[#1A9E6E] text-white flex items-center justify-center text-xs font-bold ring-4 ring-white">
              <Check size={14} />
            </div>
            <span className="text-[10px] font-bold text-[#1A9E6E]">الحساب</span>
          </div>
          
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-[#1A9E6E] text-white flex items-center justify-center text-xs font-bold ring-4 ring-white">
              2
            </div>
            <span className="text-[10px] font-bold text-[#1A9E6E]">بيانات الصيدلية</span>
          </div>
          
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold ring-4 ring-white">
              3
            </div>
            <span className="text-[10px] font-medium text-gray-400">التحقق</span>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="px-5 py-6 space-y-5">
        
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700 block">اسم الصيدلية <span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Store className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              className="w-full bg-white rounded-xl py-3 pr-10 pl-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A9E6E] border border-gray-200"
              placeholder="مثال: صيدلية الشفاء"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700 block">رقم الترخيص الصحي <span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FileText className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              dir="ltr"
              className="w-full bg-white rounded-xl py-3 pr-10 pl-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A9E6E] border border-gray-200 text-right"
              placeholder="XXXX-XXXX"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 block">المنطقة</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <MapPin className="text-gray-400" size={18} />
              </div>
              <select className="w-full bg-white rounded-xl py-3 pr-10 pl-8 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A9E6E] border border-gray-200 appearance-none text-gray-700">
                <option value="">اختر المنطقة</option>
                <option value="riyadh">الرياض</option>
                <option value="jeddah">جدة</option>
                <option value="dammam">الدمام</option>
                <option value="makkah">مكة</option>
                <option value="madinah">المدينة</option>
                <option value="abha">أبها</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 block">المدينة</label>
            <input
              type="text"
              className="w-full bg-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A9E6E] border border-gray-200"
              placeholder="المدينة"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700 block">رقم الجوال <span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Phone className="text-gray-400" size={18} />
            </div>
            <input
              type="tel"
              dir="ltr"
              className="w-full bg-white rounded-xl py-3 pr-10 pl-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A9E6E] border border-gray-200 text-right"
              placeholder="+966 5X XXX XXXX"
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="text-sm font-bold text-gray-700 block">صورة الترخيص الصحي</label>
          <div className="border-2 border-dashed border-gray-200 rounded-2xl bg-white p-6 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[#1A9E6E]">
              <Upload size={24} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-gray-700">اسحب الملف أو اضغط للرفع</p>
              <p className="text-xs text-gray-400">PDF, JPG حتى 5MB</p>
            </div>
            <button className="mt-2 bg-[#1A9E6E]/10 text-[#1A9E6E] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#1A9E6E]/20 transition-colors">
              رفع الملف
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-3">
          <div className="mt-1">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded text-[#1A9E6E] border-gray-300 focus:ring-[#1A9E6E]"
              id="terms"
            />
          </div>
          <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
            أوافق على <a href="#" className="text-[#1A9E6E] underline underline-offset-2 font-medium">الشروط والأحكام</a> و <a href="#" className="text-[#1A9E6E] underline underline-offset-2 font-medium">سياسة الخصوصية</a>
          </label>
        </div>

        <div className="pt-6 space-y-4">
          <button className="w-full bg-[#1A9E6E] text-white py-3.5 rounded-xl font-bold text-base shadow-md shadow-green-500/20 hover:bg-[#158059] transition-colors flex items-center justify-center gap-2">
            التالي: مراجعة وإرسال <ArrowRight size={18} />
          </button>
          
          <button className="w-full bg-transparent text-gray-500 py-3 rounded-xl font-bold text-sm hover:text-gray-700 transition-colors flex items-center justify-center gap-2">
            <ArrowRight size={16} className="rotate-180" /> السابق
          </button>
        </div>

      </div>
    </div>
  );
}
