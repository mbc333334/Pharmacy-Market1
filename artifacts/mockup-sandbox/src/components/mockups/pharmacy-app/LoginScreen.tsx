import React, { useState } from 'react';
import { Pill, AtSign, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState<'customer' | 'pharmacy'>('pharmacy');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div dir="rtl" className="relative max-w-sm mx-auto min-h-screen bg-[#F7F9FC] text-[#1A202C] overflow-x-hidden font-sans flex flex-col">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-[240px] bg-gradient-to-b from-[#1A9E6E] to-[#0D7A54] rounded-b-3xl -z-0"></div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col pt-12 px-6">
        
        {/* Logo Area */}
        <div className="flex flex-col items-center justify-center mb-10 text-white">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm mb-3">
            <Pill size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold mb-1 tracking-tight">دواء+</h1>
          <p className="text-white/80 text-sm">متجر الأدوية الإلكتروني</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-1 w-full flex flex-col flex-1 mb-8">
          
          {/* Tabs */}
          <div className="flex p-1 bg-gray-50 rounded-xl mb-6">
            <button 
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'pharmacy' ? 'bg-white text-[#1A9E6E] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('pharmacy')}
            >
              صيدلية
            </button>
            <button 
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'customer' ? 'bg-white text-[#1A9E6E] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('customer')}
            >
              عميل
            </button>
          </div>

          <div className="px-5 pb-6 flex-1 flex flex-col">
            <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
              {activeTab === 'pharmacy' ? 'تسجيل دخول الصيدلية' : 'تسجيل دخول العميل'}
            </h2>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 block">
                  {activeTab === 'pharmacy' ? 'البريد الإلكتروني أو رقم الرخصة' : 'البريد الإلكتروني أو رقم الجوال'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <AtSign className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="text"
                    dir="ltr"
                    className="w-full bg-gray-50 rounded-xl py-3 pr-10 pl-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A9E6E] border border-gray-100 text-right"
                    placeholder={activeTab === 'pharmacy' ? 'email@pharmacy.com' : '05XXXXXXXX'}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 block">كلمة المرور</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    dir="ltr"
                    className="w-full bg-gray-50 rounded-xl py-3 pr-10 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A9E6E] border border-gray-100 text-right"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-start pt-1">
                <a href="#" className="text-sm font-medium text-[#1A9E6E] hover:underline">
                  نسيت كلمة المرور؟
                </a>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button className="w-full bg-[#1A9E6E] text-white py-3.5 rounded-xl font-bold text-base shadow-md shadow-green-500/20 hover:bg-[#158059] transition-colors">
                تسجيل الدخول
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">أو</span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              <button className="w-full bg-white text-[#1A9E6E] border border-[#1A9E6E] py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-green-50 transition-colors">
                {activeTab === 'pharmacy' ? 'تسجيل صيدلية جديدة' : 'إنشاء حساب جديد'}
                <ArrowLeft size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-auto mb-6">
          منصة موثوقة لأكثر من 2,400 صيدلية في المملكة
        </p>

      </div>
    </div>
  );
}
