import React from 'react';
import { Bell, Home, Pill, Box, BarChart2, Settings, Plus, ClipboardList, TrendingUp, AlertTriangle } from 'lucide-react';

export default function PharmacyDashboardScreen() {
  return (
    <div dir="rtl" className="relative max-w-sm mx-auto min-h-screen bg-[#F7F9FC] text-[#1A202C] pb-24 overflow-x-hidden font-sans">
      
      {/* Header */}
      <header className="bg-gradient-to-l from-[#1A9E6E] to-[#0D7A54] px-5 pt-12 pb-6 rounded-b-3xl text-white shadow-md relative overflow-hidden">
        <div className="absolute -left-8 -top-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold mb-1">مرحباً، صيدلية الشفاء 👋</h1>
            <p className="text-white/80 text-xs">الرياض — ترخيص: 4521-9876</p>
          </div>
          <div className="flex gap-3 items-center">
            <button className="relative p-2 bg-white/20 rounded-full text-white backdrop-blur-sm">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F5A623] rounded-full"></span>
            </button>
            <div className="w-9 h-9 bg-white text-[#1A9E6E] rounded-full flex items-center justify-center font-bold text-lg shadow-sm border border-green-100">
              ص
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 pt-6 space-y-6">
        
        {/* Stats Row */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {[
            { icon: '💊', value: '247', label: 'منتج نشط', title: 'الأدوية' },
            { icon: '📦', value: '18', label: 'طلب جديد', title: 'الطلبات اليوم', color: 'text-amber-500' },
            { icon: '💰', value: '4,820', suffix: 'ر.س', label: 'هذا الشهر', title: 'المبيعات', color: 'text-green-600' },
            { icon: '⭐', value: '4.8', label: 'من 5 نجوم', title: 'التقييم' },
          ].map((stat, i) => (
            <div key={i} className="min-w-[130px] bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{stat.icon}</span>
                <span className="text-xs font-bold text-gray-600">{stat.title}</span>
              </div>
              <div className="mt-auto">
                <span className={`text-xl font-black ${stat.color || 'text-gray-900'}`}>{stat.value}</span>
                {stat.suffix && <span className="text-xs font-bold text-gray-500 mr-1">{stat.suffix}</span>}
                <span className="block text-[10px] text-gray-400 mt-0.5">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-[#1A9E6E] text-white p-3 rounded-xl shadow-sm flex items-center gap-3 hover:bg-[#158059] transition-colors">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Plus size={18} />
            </div>
            <span className="font-bold text-sm">إضافة دواء</span>
          </button>
          
          <button className="bg-[#3B82F6] text-white p-3 rounded-xl shadow-sm flex items-center gap-3 hover:bg-blue-600 transition-colors">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <ClipboardList size={18} />
            </div>
            <span className="font-bold text-sm">إدارة المخزون</span>
          </button>
          
          <button className="bg-[#F5A623] text-white p-3 rounded-xl shadow-sm flex items-center gap-3 hover:bg-amber-600 transition-colors relative">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Box size={18} />
            </div>
            <span className="font-bold text-sm">الطلبات المعلقة</span>
            <span className="absolute top-2 left-2 bg-white text-amber-500 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">5</span>
          </button>
          
          <button className="bg-[#8B5CF6] text-white p-3 rounded-xl shadow-sm flex items-center gap-3 hover:bg-purple-600 transition-colors">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <span className="font-bold text-sm">تقرير المبيعات</span>
          </button>
        </div>

        {/* Inventory Alerts */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-amber-500" size={18} />
            <h3 className="font-bold text-base">تنبيهات المخزون</h3>
          </div>
          <div className="space-y-2">
            <div className="bg-white rounded-xl p-3 shadow-sm border border-red-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm">أسبرين 100mg</h4>
                <span className="text-xs text-red-500 font-medium">باقي 3 علب فقط</span>
              </div>
              <span className="bg-red-50 text-red-600 px-2 py-1 rounded-md text-xs font-bold">نفاد وشيك</span>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-amber-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm">باراسيتامول 500mg</h4>
                <span className="text-xs text-amber-500 font-medium">باقي 8 علب</span>
              </div>
              <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-md text-xs font-bold">منخفض</span>
            </div>
          </div>
        </section>

        {/* Recent Orders */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-base">آخر الطلبات</h3>
            <button className="text-[#1A9E6E] text-xs font-bold">عرض الكل</button>
          </div>
          
          <div className="space-y-3">
            {[
              { id: '#ORD-2024-089', name: 'أحمد عبدالله', time: 'منذ 5 دق', items: 'باراسيتامول × 2، فيتامين C', price: '88.50', status: 'جديد', badgeColor: 'bg-amber-100 text-amber-700' },
              { id: '#ORD-2024-088', name: 'سارة خالد', time: 'منذ 25 دق', items: 'كريم مرطب، غسول وجه', price: '145.00', status: 'قيد التجهيز', badgeColor: 'bg-blue-100 text-blue-700' },
              { id: '#ORD-2024-087', name: 'محمد فهد', time: 'منذ ساعتين', items: 'أوميجا 3، كالسيوم', price: '120.00', status: 'مكتمل', badgeColor: 'bg-green-100 text-green-700' },
            ].map((order, i) => (
              <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block">{order.id}</span>
                    <h4 className="font-bold text-sm">{order.name}</h4>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-gray-400">{order.time}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.badgeColor}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-end border-t border-gray-50 pt-2 mt-1">
                  <p className="text-xs text-gray-500 line-clamp-1 flex-1">{order.items}</p>
                  <span className="font-black text-sm text-[#1A9E6E] mr-2 whitespace-nowrap">{order.price} <span className="text-[10px]">ر.س</span></span>
                </div>
              </div>
            ))}
          </div>
        </section>
        
      </main>

      {/* Pharmacy Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 px-5 py-3 flex justify-between items-center z-50 rounded-t-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.03)] pb-safe-bottom">
        <button className="flex flex-col items-center gap-1 text-[#1A9E6E]">
          <Home size={22} className="fill-[#1A9E6E] bg-green-50 p-1 rounded-lg w-10 h-8" />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#718096]">
          <Pill size={22} />
          <span className="text-[10px] font-medium">أدويتي</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#718096] relative">
          <Box size={22} />
          <span className="absolute -top-1 -right-1 bg-[#F5A623] text-white text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">5</span>
          <span className="text-[10px] font-medium">الطلبات</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#718096]">
          <BarChart2 size={22} />
          <span className="text-[10px] font-medium">التقارير</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#718096]">
          <Settings size={22} />
          <span className="text-[10px] font-medium">الإعدادات</span>
        </button>
      </nav>
    </div>
  );
}
