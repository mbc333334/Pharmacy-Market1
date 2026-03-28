import React, { useState } from 'react';
import { ArrowRight, Camera, FileText } from 'lucide-react';

export default function AddMedicineScreen() {
  const [qty, setQty] = useState(10);
  const [requiresRx, setRequiresRx] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <div dir="rtl" className="relative max-w-sm mx-auto min-h-screen bg-[#F7F9FC] text-[#1A202C] pb-32 overflow-x-hidden font-sans">
      
      {/* Header */}
      <header className="bg-white px-5 pt-12 pb-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
        <button className="p-2 -mr-2 text-gray-700">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-lg font-bold">إضافة دواء جديد</h1>
        <button className="text-[#1A9E6E] font-bold text-sm">
          حفظ
        </button>
      </header>

      <main className="px-5 py-6 space-y-6">
        
        {/* Section 1 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-base flex items-center gap-2 mb-2">
            <span className="w-1.5 h-4 bg-[#1A9E6E] rounded-full inline-block"></span>
            معلومات الدواء
          </h2>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">اسم الدواء بالعربي <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full bg-gray-50 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A9E6E] border border-gray-200"
              placeholder="مثال: بانادول إكسترا"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">اسم الدواء بالإنجليزي</label>
            <input
              type="text"
              dir="ltr"
              className="w-full bg-gray-50 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A9E6E] border border-gray-200 text-right"
              placeholder="Panadol Extra"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">الصنف التجاري / المصنّع</label>
            <input
              type="text"
              className="w-full bg-gray-50 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A9E6E] border border-gray-200"
              placeholder="مثال: جلاكسوسميثكلاين"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">الفئة العلاجية</label>
              <select className="w-full bg-gray-50 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A9E6E] border border-gray-200 appearance-none text-gray-700">
                <option value="">اختر الفئة</option>
                <option value="painkillers">مسكنات</option>
                <option value="antibiotics">مضادات حيوية</option>
                <option value="vitamins">فيتامينات</option>
                <option value="heart">أدوية قلب</option>
                <option value="diabetes">منظم سكر</option>
                <option value="other">أخرى</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">جرعة القوة</label>
              <input
                type="text"
                dir="ltr"
                className="w-full bg-gray-50 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A9E6E] border border-gray-200 text-right"
                placeholder="500mg, 10mg..."
              />
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-base flex items-center gap-2 mb-2">
            <span className="w-1.5 h-4 bg-[#1A9E6E] rounded-full inline-block"></span>
            الصورة والسعر
          </h2>
          
          <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 p-6 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm">
              <Camera size={20} />
            </div>
            <p className="text-sm font-medium text-gray-600">أضف صورة الدواء</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">السعر بالريال <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-xs font-bold">ر.س</span>
                </div>
                <input
                  type="number"
                  dir="ltr"
                  className="w-full bg-gray-50 rounded-xl py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A9E6E] border border-gray-200 text-right font-bold"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">الكمية المتوفرة <span className="text-red-500">*</span></label>
              <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 px-1 overflow-hidden">
                <button 
                  onClick={() => setQty(Math.max(0, qty - 1))}
                  className="w-8 h-9 flex items-center justify-center text-[#1A9E6E] font-bold text-lg hover:bg-gray-100 rounded-lg"
                >
                  -
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="flex-1 w-full bg-transparent text-center font-bold text-sm focus:outline-none m-0 p-0"
                  style={{ MozAppearance: 'textfield' }}
                />
                <button 
                  onClick={() => setQty(qty + 1)}
                  className="w-8 h-9 flex items-center justify-center text-[#1A9E6E] font-bold text-lg hover:bg-gray-100 rounded-lg"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${requiresRx ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                <FileText size={16} />
              </div>
              <span className="text-sm font-medium">يحتاج وصفة طبية</span>
            </div>
            <button 
              onClick={() => setRequiresRx(!requiresRx)}
              className={`w-11 h-6 rounded-full transition-colors relative ${requiresRx ? 'bg-[#1A9E6E]' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${requiresRx ? 'left-1' : 'right-1'}`}></span>
            </button>
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-base flex items-center gap-2 mb-2">
            <span className="w-1.5 h-4 bg-[#1A9E6E] rounded-full inline-block"></span>
            وصف إضافي
          </h2>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">الاستخدامات والتحذيرات</label>
            <textarea
              rows={3}
              className="w-full bg-gray-50 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A9E6E] border border-gray-200 resize-none"
              placeholder="اكتب هنا أي تفاصيل إضافية للعميل..."
            ></textarea>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium">متاح للبيع الآن</span>
            <button 
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-11 h-6 rounded-full transition-colors relative ${isAvailable ? 'bg-[#1A9E6E]' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAvailable ? 'left-1' : 'right-1'}`}></span>
            </button>
          </div>
        </section>

      </main>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-5 py-4 bg-white border-t border-gray-100 z-40 flex flex-col gap-3 pb-safe-bottom">
        <button className="w-full bg-[#1A9E6E] text-white py-3.5 rounded-xl font-bold text-base shadow-md shadow-green-500/20 hover:bg-[#158059] transition-colors">
          نشر الدواء
        </button>
        <button className="w-full bg-transparent text-gray-500 py-2 rounded-xl font-bold text-sm hover:text-gray-700 transition-colors">
          حفظ كمسودة
        </button>
      </div>

    </div>
  );
}
