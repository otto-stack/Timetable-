
import React, { useState, useMemo } from 'react';
import { Trash2, AlertTriangle, Calendar as CalendarIcon, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import { Booking } from '../types';

interface ManagerViewProps {
  bookings: Booking[];
  onClearMonth: (yearMonth: string) => void;
}

const ManagerView: React.FC<ManagerViewProps> = ({ bookings, onClearMonth }) => {
  const [confirmingMonth, setConfirmingMonth] = useState<string | null>(null);
  const [isFinalStep, setIsFinalStep] = useState(false);

  // Group bookings by YYYY-MM
  const monthlyGroups = useMemo(() => {
    const groups: Record<string, Booking[]> = {};
    bookings.forEach(b => {
      const ym = b.date.substring(0, 7); // YYYY-MM
      if (!groups[ym]) groups[ym] = [];
      groups[ym].push(b);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [bookings]);

  const handleStartDelete = (ym: string) => {
    setConfirmingMonth(ym);
    setIsFinalStep(false);
  };

  const handleFinalConfirm = () => {
    if (confirmingMonth) {
      onClearMonth(confirmingMonth);
      setConfirmingMonth(null);
      setIsFinalStep(false);
    }
  };

  const formatYM = (ym: string) => {
    const [year, month] = ym.split('-');
    return `${year}年 ${parseInt(month)}月`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
              <ShieldAlert size={20} />
           </div>
           <h2 className="text-2xl font-black text-slate-900">系統管理 (Manager)</h2>
        </div>
        <p className="text-sm text-slate-500 font-medium">
          在此您可以快速清理過往或錯誤的月份預約。請謹慎操作。
        </p>
      </header>

      {monthlyGroups.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-200 border-dashed">
           <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
           </div>
           <h3 className="text-xl font-black text-slate-900">目前沒有任何數據</h3>
           <p className="text-slate-400 font-medium mt-2">所有月份的預約記錄目前都是空的。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {monthlyGroups.map(([ym, group]) => (
            <div key={ym} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all">
               <div className="p-6 md:p-8 flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <CalendarIcon size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900">{formatYM(ym)}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">數據統計</p>
                      </div>
                    </div>
                    <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-600">
                      {group.length} 個預約
                    </span>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
                        <span>元朗分校 (YL)</span>
                        <span>{group.filter(b => b.locationId === 'yl').length} 堂</span>
                     </div>
                     <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500" 
                          style={{ width: `${(group.filter(b => b.locationId === 'yl').length / group.length) * 100}%` }}
                        ></div>
                     </div>
                     <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2 pt-1">
                        <span>旺角分校 (MK)</span>
                        <span>{group.filter(b => b.locationId === 'mk').length} 堂</span>
                     </div>
                     <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-500" 
                          style={{ width: `${(group.filter(b => b.locationId === 'mk').length / group.length) * 100}%` }}
                        ></div>
                     </div>
                  </div>
               </div>

               <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                     <Info size={14} />
                     危險區域
                  </div>
                  <button 
                    onClick={() => handleStartDelete(ym)}
                    className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <Trash2 size={14} />
                    清空本月
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Double Confirmation Modal */}
      {confirmingMonth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[3rem] w-full max-w-sm shadow-2xl p-10 text-center animate-in zoom-in-95 duration-300">
             <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <AlertTriangle size={40} />
             </div>
             
             <h3 className="text-2xl font-black text-slate-900 mb-4">
               {isFinalStep ? '最後確認' : '確定清空月份？'}
             </h3>
             
             <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">
               {isFinalStep 
                 ? `即將刪除 ${formatYM(confirmingMonth)} 的所有數據。此操作無法還原，請再次確認。`
                 : `您正在嘗試刪除 ${formatYM(confirmingMonth)} 的全部課程記錄。所有分校的相關預約都將被移除。`}
             </p>

             <div className="space-y-4">
                {isFinalStep ? (
                  <button 
                    onClick={handleFinalConfirm}
                    className="w-full py-5 bg-rose-600 text-white font-black rounded-2xl shadow-xl shadow-rose-200 animate-pulse active:scale-95 transition-all uppercase tracking-widest text-xs"
                  >
                    我確定要永久刪除
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsFinalStep(true)}
                    className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs"
                  >
                    下一步：確認刪除
                  </button>
                )}
                
                <button 
                  onClick={() => setConfirmingMonth(null)}
                  className="w-full py-5 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
                >
                  取消操作
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerView;
