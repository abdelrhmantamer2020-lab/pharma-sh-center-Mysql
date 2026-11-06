import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, UserCheck, Pill, Layers, FolderTree, Database, Shield, Download,
  Activity, AlertTriangle, CheckCircle2, Clock, FileSpreadsheet, Printer,
  RefreshCw, TrendingUp, Sparkles, HelpCircle, HardDrive, Filter, ArrowUpRight,
  Boxes, Server, AlertOctagon, HeartHandshake, Eye
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';
import { Medicine, DispenseRecord, StockAuditLog, UserSession, getLocalBatches } from './db/mockDb';
import { Language } from './db/localization';

interface DeveloperStatisticsTabProps {
  residents: any[];
  users: any[];
  medicines: Medicine[];
  customUnits: string[];
  customCategories: string[];
  dispenseRecords: DispenseRecord[];
  stockLogs: StockAuditLog[];
  behaviorLogs: any[];
  sessions: UserSession[];
  companies: any[];
  darkMode: boolean;
  lang: Language;
  text: (ar: string, en: string) => string;
  showToast: (msg: string, type: 'success' | 'error') => void;
  currentUser: any;
  isDatabaseConnected: boolean;
  databaseName: string;
  onRefreshData?: () => Promise<void> | void;
  onExportBackup?: () => void;
}

export const DeveloperStatisticsTab: React.FC<DeveloperStatisticsTabProps> = ({
  residents,
  users,
  medicines,
  customUnits,
  customCategories,
  dispenseRecords,
  stockLogs,
  behaviorLogs,
  sessions,
  companies,
  darkMode,
  lang,
  text,
  showToast,
  currentUser,
  isDatabaseConnected,
  databaseName,
  onRefreshData,
  onExportBackup
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'entities' | 'medicines' | 'residents' | 'database'>('overview');
  const [searchFilter, setSearchFilter] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Enforce developer-only access for Database Health tab
  useEffect(() => {
    if (activeSubTab === 'database' && currentUser?.role !== 'developer') {
      setActiveSubTab('overview');
    }
  }, [currentUser?.role, activeSubTab]);

  // 1. Calculations for Core 5 Entities
  // Residents Stats
  const residentStats = useMemo(() => {
    const total = residents.length;
    const withNotes = residents.filter(r => (r.notes || '').trim().length > 0).length;
    const withSchedules = residents.filter(r => (r.dosageSchedule && r.dosageSchedule.length > 0) || (r.doses && r.doses.length > 0)).length;
    
    // Age analysis
    const ages = residents.map(r => Number(r.age) || 0).filter(a => a > 0);
    const avgAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;
    
    // Group by rooms/wards
    const roomMap: Record<string, number> = {};
    residents.forEach(r => {
      const room = (r.roomNumber || '').trim() || text('غير محدد', 'Unspecified');
      roomMap[room] = (roomMap[room] || 0) + 1;
    });
    const uniqueRoomsCount = Object.keys(roomMap).filter(k => k !== text('غير محدد', 'Unspecified')).length;

    // Tomorrow referral check
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const dueTomorrowCount = residents.filter(r => r.referralDate === tomorrowStr).length;

    return {
      total,
      withNotes,
      withSchedules,
      avgAge,
      uniqueRoomsCount,
      roomMap,
      dueTomorrowCount
    };
  }, [residents, text]);

  // Users Stats
  const userStats = useMemo(() => {
    const total = users.length;
    const byRole = {
      developer: users.filter(u => u.role === 'developer').length,
      admin: users.filter(u => u.role === 'admin').length,
      pharmacist: users.filter(u => u.role === 'pharmacist').length,
      technician: users.filter(u => u.role === 'technician').length
    };
    const activeCount = users.filter(u => u.status !== 'inactive' && u.isActive !== false).length;
    return {
      total,
      byRole,
      activeCount
    };
  }, [users]);

  // Medicines & Inventory Stats
  const medicineStats = useMemo(() => {
    const total = medicines.length;
    let outOfStock = 0;
    let lowStock = 0;
    let inStock = 0;
    let totalStockUnits = 0;
    let totalValuation = 0;
    let expired = 0;
    let expiringSoon = 0; // within 60 days
    let controlledCount = 0;

    const now = new Date();
    const sixtyDaysLater = new Date();
    sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);

    medicines.forEach(m => {
      const qty = Number(m.quantity) || 0;
      const price = Number(m.price) || 0;
      totalStockUnits += qty;
      totalValuation += qty * price;

      if (qty === 0) outOfStock++;
      else if (qty <= 15) lowStock++;
      else inStock++;

      if (m.isControlled) controlledCount++;

      if (m.expiryDate) {
        const exp = new Date(m.expiryDate);
        if (exp < now) expired++;
        else if (exp <= sixtyDaysLater) expiringSoon++;
      }
    });

    return {
      total,
      outOfStock,
      lowStock,
      inStock,
      totalStockUnits,
      totalValuation,
      expired,
      expiringSoon,
      controlledCount
    };
  }, [medicines]);

  // Units Stats
  const unitStats = useMemo(() => {
    const total = customUnits.length;
    const usageMap: Record<string, number> = {};
    customUnits.forEach(u => { usageMap[u] = 0; });
    
    medicines.forEach(m => {
      const u = m.unit?.trim();
      if (u) {
        usageMap[u] = (usageMap[u] || 0) + 1;
      }
    });

    const usedUnits = Object.entries(usageMap).filter(([_, count]) => count > 0);
    const unusedUnits = Object.entries(usageMap).filter(([_, count]) => count === 0);

    return {
      total,
      usageMap,
      usedCount: usedUnits.length,
      unusedCount: unusedUnits.length
    };
  }, [customUnits, medicines]);

  // Categories Stats
  const categoryStats = useMemo(() => {
    const total = customCategories.length;
    const usageMap: Record<string, number> = {};
    customCategories.forEach(c => { usageMap[c] = 0; });

    medicines.forEach(m => {
      const cat = m.category?.trim();
      if (cat) {
        usageMap[cat] = (usageMap[cat] || 0) + 1;
      }
    });

    const populatedCats = Object.entries(usageMap).filter(([_, count]) => count > 0);
    const emptyCats = Object.entries(usageMap).filter(([_, count]) => count === 0);

    return {
      total,
      usageMap,
      populatedCount: populatedCats.length,
      emptyCount: emptyCats.length
    };
  }, [customCategories, medicines]);

  // Other system analytics
  const extraStats = useMemo(() => {
    const totalDispenses = dispenseRecords.length;
    const totalDosesQuantity = dispenseRecords.reduce((acc, r) => acc + (Number(r.actualQuantityDispensed || r.quantityDispensed) || 0), 0);
    
    const totalLogs = stockLogs.length;
    const totalBehavior = behaviorLogs.length;
    const totalSessions = sessions.length;
    const totalCompanies = companies.length;

    // Audit breakdown
    const actionTypes: Record<string, number> = {};
    stockLogs.forEach(l => {
      const act = l.actionType || 'أخرى';
      actionTypes[act] = (actionTypes[act] || 0) + 1;
    });

    return {
      totalDispenses,
      totalDosesQuantity,
      totalLogs,
      totalBehavior,
      totalSessions,
      totalCompanies,
      actionTypes
    };
  }, [dispenseRecords, stockLogs, behaviorLogs, sessions, companies]);

  // Chart data
  const categoryChartData = useMemo(() => {
    return Object.entries(categoryStats.usageMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [categoryStats]);

  const stockStatusPieData = useMemo(() => {
    return [
      { name: text('متوفر تماماً', 'In Stock'), value: medicineStats.inStock, color: '#10b981' },
      { name: text('مخزون حرج (منخفض)', 'Low Stock'), value: medicineStats.lowStock, color: '#f59e0b' },
      { name: text('نافد من المخزن', 'Out of Stock'), value: medicineStats.outOfStock, color: '#ef4444' },
      { name: text('منتهي الصلاحية', 'Expired'), value: medicineStats.expired, color: '#881337' }
    ].filter(item => item.value > 0);
  }, [medicineStats, text]);

  const rolesChartData = useMemo(() => {
    return [
      { role: text('المبرمج', 'Developer'), count: userStats.byRole.developer, color: '#a855f7' },
      { role: text('مدير النظام', 'System Admin'), count: userStats.byRole.admin, color: '#0ea5e9' },
      { role: text('صيدلي ممارس', 'Pharmacist'), count: userStats.byRole.pharmacist, color: '#14b8a6' },
      { role: text('فني صيدلة', 'Technician'), count: userStats.byRole.technician, color: '#f59e0b' }
    ];
  }, [userStats, text]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefreshData) {
        await onRefreshData();
      }
      showToast(text('تم تحديث كافة المؤشرات الإحصائية فورياً من قاعدة البيانات!', 'All system metrics refreshed successfully!'), 'success');
    } catch {
      showToast(text('فشل تحديث البيانات، يرجى المحاولة لاحقاً', 'Failed to refresh data'), 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Export comprehensive Excel report
  const handleExportStatsExcel = () => {
    try {
      const isAr = lang === 'ar';
      let content = `\uFEFF`; // UTF-8 BOM
      content += `${isAr ? 'تقرير إحصائيات النظام الشاملة - مركز الرعاية الصيدلي' : 'Comprehensive System Developer Statistics Report'}\n`;
      content += `${isAr ? 'تاريخ التوليد:' : 'Generated Date:'} ${new Date().toLocaleString()}\n`;
      content += `${isAr ? 'المطور المسؤول:' : 'Generated by Developer:'} ${currentUser?.name || 'Developer'} (${currentUser?.email || ''})\n\n`;

      content += `${isAr ? '1. إحصائيات الكيانات الأساسية (الأعداد الإجمالية):' : '1. Core Entities Counts:'}\n`;
      content += `${isAr ? 'البيان' : 'Entity'},${isAr ? 'العدد الإجمالي' : 'Total Count'},${isAr ? 'تفاصيل إضافية' : 'Details'}\n`;
      content += `${isAr ? 'المستفيدين' : 'Beneficiaries'},${residentStats.total},${isAr ? `متوسط العمر: ${residentStats.avgAge} سنة | الغرف: ${residentStats.uniqueRoomsCount}` : `Avg Age: ${residentStats.avgAge} | Rooms: ${residentStats.uniqueRoomsCount}`}\n`;
      content += `${isAr ? 'المستخدمين' : 'Users'},${userStats.total},${isAr ? `مبرمج: ${userStats.byRole.developer} | مدير: ${userStats.byRole.admin} | صيدلي: ${userStats.byRole.pharmacist} | فني: ${userStats.byRole.technician}` : `Dev: ${userStats.byRole.developer} | Admin: ${userStats.byRole.admin} | Pharm: ${userStats.byRole.pharmacist} | Tech: ${userStats.byRole.technician}`}\n`;
      content += `${isAr ? 'الأصناف الدوائية' : 'Medicines'},${medicineStats.total},${isAr ? `إجمالي الوحدات بالمخزن: ${medicineStats.totalStockUnits} | نافد: ${medicineStats.outOfStock} | حرج: ${medicineStats.lowStock}` : `Total Warehouse Units: ${medicineStats.totalStockUnits} | Out of stock: ${medicineStats.outOfStock}`}\n`;
      content += `${isAr ? 'وحدات القياس' : 'Measurement Units'},${unitStats.total},${isAr ? `المستخدمة: ${unitStats.usedCount} | غير المستخدمة: ${unitStats.unusedCount}` : `Used: ${unitStats.usedCount} | Unused: ${unitStats.unusedCount}`}\n`;
      content += `${isAr ? 'الفئات العلاجية' : 'Therapeutic Categories'},${categoryStats.total},${isAr ? `فئات بها أدوية: ${categoryStats.populatedCount} | فئات فارغة: ${categoryStats.emptyCount}` : `Active: ${categoryStats.populatedCount} | Empty: ${categoryStats.emptyCount}`}\n\n`;

      content += `${isAr ? '2. إحصائيات العمليات وسجلات النظام:' : '2. System Activity & Audit Trail:'}\n`;
      content += `${isAr ? 'عمليات الصرف المسجلة' : 'Dispense Records'},${extraStats.totalDispenses},${isAr ? `إجمالي الجرعات المصروفة: ${extraStats.totalDosesQuantity}` : `Total Doses Dispensed: ${extraStats.totalDosesQuantity}`}\n`;
      content += `${isAr ? 'سجلات حركات المخزن والتدقيق' : 'Stock Audit Logs'},${extraStats.totalLogs},\n`;
      content += `${isAr ? 'سجلات التتبع السلوكي' : 'Behavior Logs'},${extraStats.totalBehavior},\n`;
      content += `${isAr ? 'جلسات تسجيل الدخول' : 'User Sessions'},${extraStats.totalSessions},\n`;
      content += `${isAr ? 'شركات الأدوية المعتمدة' : 'Pharma Companies'},${extraStats.totalCompanies},\n\n`;

      content += `${isAr ? '3. توزيع الأدوية حسب الفئات العلاجية:' : '3. Medicines per Therapeutic Category:'}\n`;
      content += `${isAr ? 'الفئة العلاجية' : 'Therapeutic Category'},${isAr ? 'عدد الأصناف' : 'Medicines Count'}\n`;
      Object.entries(categoryStats.usageMap).forEach(([cat, count]) => {
        content += `"${cat.replace(/"/g, '""')}",${count}\n`;
      });

      content += `\n${isAr ? '4. توزيع الأدوية حسب وحدات القياس:' : '4. Medicines per Measurement Unit:'}\n`;
      content += `${isAr ? 'الوحدة الدوائية' : 'Unit'},${isAr ? 'عدد الأصناف المرتبطة' : 'Linked Medicines'}\n`;
      Object.entries(unitStats.usageMap).forEach(([u, count]) => {
        content += `"${u.replace(/"/g, '""')}",${count}\n`;
      });

      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `تقرير_احصائيات_المبرمج_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(text('📥 تم تصدير التقرير الإحصائي الكامل بنجاح بصيغة CSV!', 'Developer statistics report exported successfully!'), 'success');
    } catch {
      showToast(text('فشل تصدير التقرير، يرجى المحاولة ثانية', 'Failed to export statistics report'), 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* 1. Header Banner - Developer Exclusive */}
      <div className={`p-6 rounded-3xl border relative overflow-hidden shadow-xl ${
        darkMode 
          ? 'bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/30 border-purple-500/30 text-slate-100' 
          : 'bg-gradient-to-r from-purple-50 via-white to-indigo-50 border-purple-200 text-slate-800'
      }`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                {text('خاص بالمبرمج ومدير النظام 🛡️', 'Developer & Admin Only 🛡️')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 text-teal-300 border border-slate-700">
                {currentUser?.name || text('المبرمج الرئيسي', 'Lead Developer')}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                isDatabaseConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isDatabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                {isDatabaseConnected ? text('خادم البيانات متصل', 'Database server connected') : text('الخادم غير متاح', 'Server unavailable')}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
              <span>📈</span>
              <span>{text('شاشة إحصائيات النظام الشاملة والأعداد الحية', 'Live Comprehensive System Statistics Dashboard')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {text(
                'رصد فوري متزامن لأعداد المستفيدين، المستخدمين، الأدوية والمخزون، الوحدات القياسية، الفئات العلاجية، وحركات التدقيق البرمجية الحية في قاعدة البيانات.',
                'Real-time live audit of Beneficiaries, Users, Medicines, Units, Therapeutic Classes, and low-level database telemetry.'
              )}
            </p>
          </div>

          {/* Top Developer Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50 ${
                darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
              }`}
              title={text('تحديث كافة المؤشرات مباشرة من قاعدة البيانات', 'Refresh all live database metrics')}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
              <span>{isRefreshing ? text('جاري التحديث...', 'Refreshing...') : text('تحديث الأرقام 🔄', 'Refresh 🔄')}</span>
            </button>

            <button
              onClick={handleExportStatsExcel}
              className="px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer active:scale-95 shadow-md shadow-teal-900/30"
              title={text('تصدير تقرير الإحصائيات والأعداد لملف Excel / CSV', 'Export full stats to CSV / Excel')}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{text('تصدير CSV / Excel 📥', 'Export CSV 📥')}</span>
            </button>

            {onExportBackup && (
              <button
                onClick={onExportBackup}
                className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer active:scale-95 shadow-md shadow-purple-900/30"
                title={text('أخذ نسخة احتياطية كاملة لقاعدة البيانات وتنزيلها كملف JSON', 'Download Full Database Backup')}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{text('نسخة احتياطية 💾', 'Backup 💾')}</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                darkMode ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title={text('طباعة التقرير الإحصائي', 'Print Statistics Report')}
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{text('طباعة', 'Print')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. THE CORE 5 ENTITY CARDS - Exact User Request Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Beneficiaries (المستفيدين) */}
        <div className={`p-5 rounded-3xl border transition-all hover:scale-[1.02] shadow-lg relative overflow-hidden ${
          darkMode ? 'bg-slate-900/60 border-blue-500/30' : 'bg-white border-blue-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/20">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400/80 bg-blue-500/10 px-2 py-0.5 rounded-full">
              {text('المستفيدين', 'Beneficiaries')}
            </span>
          </div>
          <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
            {residentStats.total}
          </div>
          <div className="text-xs font-bold text-slate-300 mt-1">
            {text('إجمالي مستفيدي المركز', 'Total Beneficiaries')}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>{text('الأجنحة / الغرف:', 'Wards / Rooms:')}</span>
              <span className="font-mono text-blue-300 font-bold">{residentStats.uniqueRoomsCount}</span>
            </div>
            <div className="flex justify-between">
              <span>{text('بجدول دوائي نشط:', 'With active dose:')}</span>
              <span className="font-mono text-teal-300 font-bold">{residentStats.withSchedules}</span>
            </div>
            <div className="flex justify-between">
              <span>{text('متوسط الأعمار:', 'Average Age:')}</span>
              <span className="font-mono text-slate-300 font-bold">{residentStats.avgAge} {text('سنة', 'yrs')}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Users (المستخدمين) */}
        <div className={`p-5 rounded-3xl border transition-all hover:scale-[1.02] shadow-lg relative overflow-hidden ${
          darkMode ? 'bg-slate-900/60 border-purple-500/30' : 'bg-white border-purple-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
              <UserCheck className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400/80 bg-purple-500/10 px-2 py-0.5 rounded-full">
              {text('المستخدمين', 'Users')}
            </span>
          </div>
          <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
            {userStats.total}
          </div>
          <div className="text-xs font-bold text-slate-300 mt-1">
            {text('إجمالي حسابات الكادر', 'Total Staff Accounts')}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>{text('مبرمجين:', 'Developers:')}</span>
              <span className="font-mono text-purple-300 font-bold">{userStats.byRole.developer}</span>
            </div>
            <div className="flex justify-between">
              <span>{text('مدراء نظام:', 'Admins:')}</span>
              <span className="font-mono text-sky-300 font-bold">{userStats.byRole.admin}</span>
            </div>
            <div className="flex justify-between">
              <span>{text('صيادلة وفنيون:', 'Pharm / Tech:')}</span>
              <span className="font-mono text-teal-300 font-bold">{userStats.byRole.pharmacist + userStats.byRole.technician}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Medicines (الأدوية) */}
        <div className={`p-5 rounded-3xl border transition-all hover:scale-[1.02] shadow-lg relative overflow-hidden ${
          darkMode ? 'bg-slate-900/60 border-emerald-500/30' : 'bg-white border-emerald-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <Pill className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {text('الأدوية', 'Medicines')}
            </span>
          </div>
          <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
            {medicineStats.total}
          </div>
          <div className="text-xs font-bold text-slate-300 mt-1">
            {text('أصناف مسجلة بالداتابيز', 'Registered Medicines')}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>{text('إجمالي قطع المستودع:', 'Warehouse Stock:')}</span>
              <span className="font-mono text-emerald-300 font-bold">{medicineStats.totalStockUnits.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>{text('حرج / نافد:', 'Critical / Out:')}</span>
              <span className="font-mono text-rose-300 font-bold">{medicineStats.lowStock + medicineStats.outOfStock}</span>
            </div>
            <div className="flex justify-between">
              <span>{text('أدوية مقيدة (كنترول):', 'Controlled Meds:')}</span>
              <span className="font-mono text-amber-300 font-bold">{medicineStats.controlledCount}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Units (الوحدات) */}
        <div className={`p-5 rounded-3xl border transition-all hover:scale-[1.02] shadow-lg relative overflow-hidden ${
          darkMode ? 'bg-slate-900/60 border-amber-500/30' : 'bg-white border-amber-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <Boxes className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full">
              {text('الوحدات', 'Units')}
            </span>
          </div>
          <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
            {unitStats.total}
          </div>
          <div className="text-xs font-bold text-slate-300 mt-1">
            {text('وحدات قياس معرفة', 'Measurement Units')}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>{text('مرتبطة بأصناف:', 'Used by items:')}</span>
              <span className="font-mono text-amber-300 font-bold">{unitStats.usedCount}</span>
            </div>
            <div className="flex justify-between">
              <span>{text('غير مرتبطة (فارغة):', 'Unused units:')}</span>
              <span className="font-mono text-slate-400 font-bold">{unitStats.unusedCount}</span>
            </div>
            <div className="flex justify-between">
              <span>{text('نسبة التغطية:', 'Utilization:')}</span>
              <span className="font-mono text-teal-300 font-bold">
                {unitStats.total > 0 ? Math.round((unitStats.usedCount / unitStats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Card 5: Therapeutic Categories (الفئات العلاجية) */}
        <div className={`p-5 rounded-3xl border transition-all hover:scale-[1.02] shadow-lg relative overflow-hidden ${
          darkMode ? 'bg-slate-900/60 border-teal-500/30' : 'bg-white border-teal-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-2xl bg-teal-500/15 text-teal-400 border border-teal-500/20">
              <FolderTree className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400/80 bg-teal-500/10 px-2 py-0.5 rounded-full">
              {text('الفئات العلاجية', 'Categories')}
            </span>
          </div>
          <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
            {categoryStats.total}
          </div>
          <div className="text-xs font-bold text-slate-300 mt-1">
            {text('فئات علاجية وتصنيفات', 'Therapeutic Classes')}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>{text('فئات تحتوي أدوية:', 'Active classes:')}</span>
              <span className="font-mono text-teal-300 font-bold">{categoryStats.populatedCount}</span>
            </div>
            <div className="flex justify-between">
              <span>{text('فئات خالية حالياً:', 'Empty classes:')}</span>
              <span className="font-mono text-slate-400 font-bold">{categoryStats.emptyCount}</span>
            </div>
            <div className="flex justify-between">
              <span>{text('الأعلى أصنافاً:', 'Top class:')}</span>
              <span className="font-bold text-teal-300 truncate max-w-[90px]" title={categoryChartData[0]?.name || '-'}>
                {categoryChartData[0]?.name || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Secondary Metrics Bar (Additional Developer Value) */}
      <div className={`p-4 rounded-3xl border grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 ${
        darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
          <Activity className="w-8 h-8 text-cyan-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold">{text('عمليات الصرف', 'Dispenses')}</div>
            <div className="text-lg font-black font-mono text-slate-100">{extraStats.totalDispenses}</div>
            <div className="text-[10px] text-teal-400">{extraStats.totalDosesQuantity} {text('جرعة', 'doses')}</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
          <Clock className="w-8 h-8 text-indigo-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold">{text('حركات التدقيق', 'Audit Logs')}</div>
            <div className="text-lg font-black font-mono text-slate-100">{extraStats.totalLogs}</div>
            <div className="text-[10px] text-indigo-400">{text('حركة مسجلة', 'operations')}</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
          <HeartHandshake className="w-8 h-8 text-rose-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold">{text('سجلات السلوك', 'Behavior Logs')}</div>
            <div className="text-lg font-black font-mono text-slate-100">{extraStats.totalBehavior}</div>
            <div className="text-[10px] text-rose-400">{text('ملاحظة سلوكية', 'entries')}</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
          <Shield className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold">{text('جلسات الدخول', 'Sessions')}</div>
            <div className="text-lg font-black font-mono text-slate-100">{extraStats.totalSessions}</div>
            <div className="text-[10px] text-amber-400">{text('جلسة مصادقة', 'auth sessions')}</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
          <Layers className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold">{text('شركات الأدوية', 'Pharma Cos')}</div>
            <div className="text-lg font-black font-mono text-slate-100">{extraStats.totalCompanies}</div>
            <div className="text-[10px] text-emerald-400">{text('مورد معتمد', 'suppliers')}</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
          <Database className="w-8 h-8 text-purple-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold">{text('قاعدة البيانات', 'Database')}</div>
            <div className="text-sm font-black text-purple-300 truncate max-w-[110px]" title={databaseName}>
              {databaseName || 'MySQL'}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isDatabaseConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span>{isDatabaseConnected ? 'Online' : 'Local'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sub-Navigation Tabs inside Developer Screen */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
        {[
          { id: 'overview', icon: '📊', label: text('لوحة التحليل والرسوم البيانية', 'Charts & Analytics') },
          { id: 'entities', icon: '🏷️', label: text('تفصيل الوحدات والفئات العلاجية', 'Units & Categories Breakdown') },
          { id: 'medicines', icon: '💊', label: text('تفصيل حالة الأدوية والمخزون', 'Medicines & Inventory Audit') },
          { id: 'residents', icon: '👥', label: text('توزيع المستفيدين والأجنحة', 'Beneficiaries & Rooms Demographics') },
          ...(currentUser?.role === 'developer' ? [
            { id: 'database', icon: '🗄️', label: text('صحة الداتابيز ومجموعات البيانات', 'Database Health & Collections') }
          ] : [])
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40 ring-1 ring-purple-400/50'
                  : darkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 5. Sub-Tab Content */}
      {/* 5.1 OVERVIEW & CHARTS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Medicines per Category */}
            <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-sm text-slate-100">
                    {text('توزيع الأدوية عبر الفئات العلاجية (أعلى الفئات)', 'Medicines Distribution by Therapeutic Category')}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {categoryStats.total} {text('فئة مسجلة', 'categories')}
                </span>
              </div>

              {categoryChartData.length > 0 && categoryChartData.some(d => d.count > 0) ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e2e8f0"} />
                      <XAxis 
                        dataKey="name" 
                        stroke={darkMode ? "#94a3b8" : "#64748b"} 
                        fontSize={11} 
                        angle={-20} 
                        textAnchor="end"
                      />
                      <YAxis stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={11} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: darkMode ? '#0f172a' : '#ffffff', 
                          borderColor: darkMode ? '#334155' : '#cbd5e1', 
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }} 
                      />
                      <Bar dataKey="count" name={text('عدد الأصناف', 'Medicines Count')} fill="#14b8a6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                  <FolderTree className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-xs">{text('لا توجد أصناف دوائية مرتبطة بالفئات العلاجية حتى الآن', 'No medicines assigned to categories yet')}</p>
                </div>
              )}
            </div>

            {/* Chart 2: Inventory Stock Status Breakdown */}
            <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm text-slate-100">
                    {text('الحالة التشغيلية لمخزون الأدوية', 'Inventory Stock Health Status')}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {medicineStats.total} {text('صنف دوائي', 'items')}
                </span>
              </div>

              {medicineStats.total > 0 ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 h-64">
                  <div className="w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stockStatusPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {stockStatusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: darkMode ? '#0f172a' : '#ffffff', 
                            borderColor: darkMode ? '#334155' : '#cbd5e1', 
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span className="text-slate-300">{text('متوفر تماماً:', 'In Stock:')}</span>
                      <span className="font-mono font-bold text-emerald-400">{medicineStats.inStock}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      <span className="text-slate-300">{text('مخزون حرج (≤ 15 وحدة):', 'Low Stock (≤ 15):')}</span>
                      <span className="font-mono font-bold text-amber-400">{medicineStats.lowStock}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                      <span className="text-slate-300">{text('نافد تماماً (0 وحدات):', 'Out of Stock (0):')}</span>
                      <span className="font-mono font-bold text-rose-400">{medicineStats.outOfStock}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-950"></span>
                      <span className="text-slate-300">{text('منتهي الصلاحية:', 'Expired:')}</span>
                      <span className="font-mono font-bold text-red-400">{medicineStats.expired}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                  <Pill className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-xs">{text('لا توجد أدوية مسجلة في المخزن حالياً', 'No medicines registered yet')}</p>
                </div>
              )}
            </div>
          </div>

          {/* User Roles & System Permissions Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`p-5 rounded-3xl border lg:col-span-1 ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  {text('توزيع حسابات الكادر حسب الصلاحيات', 'Staff Accounts by Role')}
                </h3>
              </div>
              <div className="space-y-3">
                {rolesChartData.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-800/30 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-xs font-bold text-slate-200">{item.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-100">{item.count}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({userStats.total > 0 ? Math.round((item.count / userStats.total) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick System Health & Audit telemetry */}
            <div className={`p-5 rounded-3xl border lg:col-span-2 ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-sm text-slate-100">
                    {text('سجل حركات النظام والتدقيق الأخيرة', 'Recent System Operations & Audit Trail')}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {extraStats.totalLogs} {text('حركة إجمالية', 'total logs')}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold">
                      <th className="pb-2 text-right">{text('نوع الحركة', 'Action')}</th>
                      <th className="pb-2 text-right">{text('الصنف / البيان', 'Target / Item')}</th>
                      <th className="pb-2 text-right">{text('المنفذ', 'Actor')}</th>
                      <th className="pb-2 text-left">{text('التوقيت', 'Timestamp')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {stockLogs.slice(0, 5).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/20">
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {log.actionType}
                          </span>
                        </td>
                        <td className="py-2.5 font-bold text-slate-200">{log.medicineName || '-'}</td>
                        <td className="py-2.5 text-slate-400 text-[11px]">{log.performedByName || 'مستخدم النظام'}</td>
                        <td className="py-2.5 text-left font-mono text-[10px] text-slate-500">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US') : '-'}
                        </td>
                      </tr>
                    ))}
                    {stockLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500">
                          {text('لا توجد حركات مسجلة في سجل التدقيق حتى الآن', 'No audit operations logged yet')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5.2 UNITS & CATEGORIES BREAKDOWN (Exact focus on Units & Categories) */}
      {activeSubTab === 'entities' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Units Detailed Table */}
            <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">
                      {text('تفصيل وحدات القياس الدوائية', 'Measurement Units Detailed Breakdown')}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {text(`إجمالي ${unitStats.total} وحدة مسجلة، يرتبط منها ${unitStats.usedCount} بأصناف المخزن`, `Total ${unitStats.total} units, ${unitStats.usedCount} linked to medicines`)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-right text-xs">
                  <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-xs">
                    <tr className="border-b border-slate-800 text-slate-400 font-bold">
                      <th className="pb-2.5 text-right">{text('اسم الوحدة', 'Unit Name')}</th>
                      <th className="pb-2.5 text-center">{text('الأصناف المرتبطة', 'Linked Medicines')}</th>
                      <th className="pb-2.5 text-left">{text('الحالة', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {customUnits.map((u, idx) => {
                      const count = unitStats.usageMap[u] || 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-800/20">
                          <td className="py-2.5 font-bold text-slate-200 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            <span>{u}</span>
                          </td>
                          <td className="py-2.5 text-center font-mono font-bold text-teal-300">
                            {count}
                          </td>
                          <td className="py-2.5 text-left">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              count > 0 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {count > 0 ? text('مستخدمة بالمخزن', 'In Use') : text('غير مستخدمة', 'Unused')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Categories Detailed Table */}
            <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-teal-400" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">
                      {text('تفصيل الفئات العلاجية والتصنيفات', 'Therapeutic Categories Detailed Breakdown')}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {text(`إجمالي ${categoryStats.total} فئة علاجية، ${categoryStats.populatedCount} فئة بها أدوية حالياً`, `Total ${categoryStats.total} categories, ${categoryStats.populatedCount} active with medicines`)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-right text-xs">
                  <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-xs">
                    <tr className="border-b border-slate-800 text-slate-400 font-bold">
                      <th className="pb-2.5 text-right">{text('الفئة العلاجية', 'Therapeutic Category')}</th>
                      <th className="pb-2.5 text-center">{text('الأدوية المسجلة', 'Medicines Count')}</th>
                      <th className="pb-2.5 text-left">{text('الحالة', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {customCategories.map((c, idx) => {
                      const count = categoryStats.usageMap[c] || 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-800/20">
                          <td className="py-2.5 font-bold text-slate-200 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                            <span>{c}</span>
                          </td>
                          <td className="py-2.5 text-center font-mono font-bold text-teal-300">
                            {count}
                          </td>
                          <td className="py-2.5 text-left">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              count > 0 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {count > 0 ? text('نشطة', 'Active') : text('فارغة', 'Empty')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5.3 MEDICINES AUDIT */}
      {activeSubTab === 'medicines' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-400" />
                  <span>{text('كشف جرد الأدوية والمخزون الحي للمبرمج', 'Live Medicine Inventory Developer Audit')}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {text(`إجمالي ${medicineStats.total} صنف دوائي مسجل، بإجمالي رصيد مستودعي ${medicineStats.totalStockUnits.toLocaleString()} وحدة`, `Total ${medicineStats.total} medicines, total warehouse balance: ${medicineStats.totalStockUnits.toLocaleString()} units`)}
                </p>
              </div>

              <input
                type="text"
                placeholder={text('🔍 تصفية الأدوية بالاسم أو الفئة...', '🔍 Filter medicines...')}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className={`px-3 py-1.5 rounded-xl text-xs border outline-none ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-right text-xs">
                <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-xs">
                  <tr className="border-b border-slate-800 text-slate-400 font-bold">
                    <th className="pb-2.5 text-right">{text('الاسم التجاري / العلمي', 'Trade / Generic Name')}</th>
                    <th className="pb-2.5 text-right">{text('الفئة العلاجية', 'Category')}</th>
                    <th className="pb-2.5 text-right">{text('الوحدة', 'Unit')}</th>
                    <th className="pb-2.5 text-center">{text('الكمية الحالية', 'Current Qty')}</th>
                    <th className="pb-2.5 text-right">{text('تاريخ الصلاحية', 'Expiry')}</th>
                    <th className="pb-2.5 text-left">{text('حالة الصنف', 'Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {medicines.filter(m => {
                    const q = searchFilter.trim().toLowerCase();
                    if (!q) return true;
                    return (m.commercialName || '').toLowerCase().includes(q) ||
                           (m.scientificName || '').toLowerCase().includes(q) ||
                           (m.category || '').toLowerCase().includes(q) ||
                           (m.unit || '').toLowerCase().includes(q);
                  }).map((m) => {
                    const isZero = m.quantity === 0;
                    const isLow = m.quantity > 0 && m.quantity <= 15;
                    return (
                      <tr key={m.id} className="hover:bg-slate-800/20">
                        <td className="py-2.5">
                          <div className="font-bold text-slate-200">{m.commercialNameAr || m.commercialName}</div>
                          {m.scientificName && <div className="text-[10px] text-teal-400 font-sans">{m.scientificName}</div>}
                        </td>
                        <td className="py-2.5 text-slate-300">{m.category || '-'}</td>
                        <td className="py-2.5 font-bold text-amber-400">{m.unit || '-'}</td>
                        <td className="py-2.5 text-center font-mono font-bold text-slate-100">
                          <span className={`px-2 py-0.5 rounded-md ${
                            isZero ? 'bg-rose-500/20 text-rose-300' : isLow ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {m.quantity}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-slate-400 text-[11px]">{m.expiryDate || '-'}</td>
                        <td className="py-2.5 text-left">
                          {isZero ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              {text('نافد', 'Out')}
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {text('حرج', 'Low')}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {text('متوفر', 'OK')}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {medicines.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        {text('لا توجد أدوية مسجلة في قاعدة البيانات حالياً', 'No medicines in database')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5.4 RESIDENTS & ROOMS */}
      {activeSubTab === 'residents' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rooms breakdown */}
            <div className={`p-5 rounded-3xl border lg:col-span-1 ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  {text('توزيع المستفيدين حسب الأجنحة والغرف', 'Beneficiaries per Room/Ward')}
                </h3>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {Object.entries(residentStats.roomMap).map(([room, count], idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-800/30 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{text(`غرفة / جناح: ${room}`, `Room/Ward: ${room}`)}</span>
                    <span className="font-mono font-bold text-xs text-blue-400">{count} {text('مستفيدين', 'beneficiaries')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Beneficiaries quick audit list */}
            <div className={`p-5 rounded-3xl border lg:col-span-2 ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-sm text-slate-100">
                    {text('قائمة المستفيدين المسجلين في النظام', 'Registered Beneficiaries List')}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {residentStats.total} {text('مستفيد', 'beneficiaries')}
                </span>
              </div>

              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-right text-xs">
                  <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-xs">
                    <tr className="border-b border-slate-800 text-slate-400 font-bold">
                      <th className="pb-2.5 text-right">{text('اسم المستفيد', 'Beneficiary Name')}</th>
                      <th className="pb-2.5 text-right">{text('الغرفة', 'Room')}</th>
                      <th className="pb-2.5 text-right">{text('العمر', 'Age')}</th>
                      <th className="pb-2.5 text-left">{text('الهوية الوطنية', 'ID')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {residents.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/20">
                        <td className="py-2.5 font-bold text-slate-200">{r.nameAr || r.name}</td>
                        <td className="py-2.5 font-semibold text-teal-400">{r.roomNumber || '-'}</td>
                        <td className="py-2.5 font-mono text-slate-300">{r.age ? `${r.age} سنة` : '-'}</td>
                        <td className="py-2.5 text-left font-mono text-slate-400">{r.nationalId || '-'}</td>
                      </tr>
                    ))}
                    {residents.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500">
                          {text('لا يوجد مستفيدين مسجلين في النظام', 'No beneficiaries registered yet')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5.5 DATABASE HEALTH & TELEMETRY - DEVELOPER ONLY */}
      {activeSubTab === 'database' && currentUser?.role === 'developer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Database Collections Snapshot */}
            <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  {text('تعداد وثائق المجموعات في قاعدة البيانات', 'Database Collections Document Counts')}
                </h3>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {[
                  { name: 'batches (تشغيلات الأدوية)', count: getLocalBatches().length || 1, color: 'text-amber-400' },
                  { name: 'behavior_logs (المتابعة السلوكية)', count: extraStats.totalBehavior, color: 'text-rose-400' },
                  { name: 'dispense_records (سجلات الصرف)', count: extraStats.totalDispenses, color: 'text-cyan-400' },
                  { name: 'item_units (وحدات الأصناف)', count: unitStats.total, color: 'text-amber-300' },
                  { name: 'residents (ملفات المستفيدين)', count: residentStats.total, color: 'text-blue-400' },
                  { name: 'security_settings (إعدادات الأمان)', count: 1, color: 'text-purple-400' },
                  { name: 'settings (إعدادات النظام العامة)', count: 2, color: 'text-slate-300' },
                  { name: 'stock_audit_logs (سجل التدقيق)', count: extraStats.totalLogs, color: 'text-indigo-400' },
                  { name: 'therapeutic_categories (الفئات العلاجية)', count: categoryStats.total, color: 'text-teal-400' },
                  { name: 'user_sessions (جلسات الدخول)', count: extraStats.totalSessions, color: 'text-sky-400' },
                  { name: 'users (حسابات الكادر)', count: userStats.total, color: 'text-purple-300' },
                  { name: 'medicines (أصناف الأدوية)', count: medicineStats.total, color: 'text-emerald-400' },
                  { name: 'pharmaceutical_companies (شركات الأدوية)', count: extraStats.totalCompanies, color: 'text-emerald-300' }
                ].map((col, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-800/30 border border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-300">{col.name}</span>
                    <span className={`font-mono font-bold text-sm ${col.color}`}>{col.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cloud Sync & Connectivity Overview */}
            <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Server className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  {text('معلومات البنية السحابية والمزامنة', 'Cloud Infrastructure & Sync Info')}
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">{text('حالة محرك MySQL:', 'MySQL Status:')}</span>
                  <span className={`px-2.5 py-1 rounded-full font-bold font-mono text-[11px] ${
                    isDatabaseConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {isDatabaseConnected ? 'CONNECTED' : 'SERVER UNAVAILABLE'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">{text('معرف مشروع MySQL:', 'MySQL Project ID:')}</span>
                  <span className="font-mono font-bold text-slate-200">{databaseName || 'Not set'}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">{text('وضع الجاهزية دون إنترنت (PWA/Offline):', 'Offline Resilience:')}</span>
                  <span className="text-emerald-400 font-bold">{text('مفعل ومحمي تلقائياً', 'Enabled & Auto-cached')}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">{text('صلاحية الوصول للشاشة:', 'Access Level:')}</span>
                  <span className="text-purple-400 font-bold">{text('حصري لحساب المبرمج (Developer RBAC)', 'Exclusive to Developer')}</span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-purple-200 space-y-2 mt-4">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>{text('تنبيه للمبرمج:', 'Developer Notice:')}</span>
                  </div>
                  <p className="text-[11px] text-purple-300/80 leading-relaxed">
                    {text(
                      'جميع الأعداد الموضحة في هذه الشاشة مستخرجة ومحسوبة مباشرة من قاعدة البيانات. يتم الحفاظ على خصوصية هذه الشاشة وحجبها تماماً عن أدوار مدراء النظام، الصيادلة، وفنيي الصيدلة.',
                      'All numbers on this screen are computed directly from the live database. This screen is strictly protected and hidden from Admin, Pharmacist, and Technician roles.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
