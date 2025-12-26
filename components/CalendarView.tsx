
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Booking, BookingType, TEACHERS } from '../types';

interface CalendarViewProps {
  bookings: Booking[];
  onAddClick: (date: string) => void;
  onDeleteBooking: (id: string) => void;
}

// Helper for local YYYY-MM-DD
const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CalendarView: React.FC<CalendarViewProps> = ({ bookings, onAddClick, onDeleteBooking }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string>(getLocalDateString(new Date()));

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(new Date(year, month, d));

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const getBookingsForDay = (dateStr: string) => {
    return bookings
      .filter(b => b.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const selectedDayBookings = useMemo(() => getBookingsForDay(selectedDay), [bookings, selectedDay]);

  const displayDate = new Date(selectedDay).toLocaleDateString('zh-HK', { 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Mini Calendar Selector */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-black text-slate-900">{monthName}</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{year}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 text-slate-400 hover:text-indigo-600"><ChevronLeft size={20} /></button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 text-slate-400 hover:text-indigo-600"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/30">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="py-2.5 text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((date, idx) => {
            const dateStr = date ? getLocalDateString(date) : '';
            const isSelected = selectedDay === dateStr;
            const isToday = date ? getLocalDateString(date) === getLocalDateString(new Date()) : false;
            const dayBookings = date ? getBookingsForDay(dateStr) : [];

            return (
              <div 
                key={idx} 
                className={`aspect-square p-1 border-r border-b border-slate-50 last:border-r-0 transition-all relative ${
                  date ? 'hover:bg-indigo-50/20 cursor-pointer' : 'bg-slate-50/10'
                } ${isSelected ? 'bg-indigo-50/80 z-10' : ''}`}
                onClick={() => date && setSelectedDay(dateStr)}
              >
                {date && (
                  <div className="h-full flex flex-col items-center justify-center">
                    <span className={`text-[13px] font-black w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                      isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : isSelected ? 'bg-indigo-200 text-indigo-700' : 'text-slate-600'
                    }`}>
                      {date.getDate()}
                    </span>
                    {dayBookings.length > 0 && !isSelected && (
                      <div className="absolute bottom-1.5 flex gap-0.5">
                        {dayBookings.slice(0, 3).map(b => (
                          <div key={b.id} className={`w-1 h-1 rounded-full ${TEACHERS.find(t => t.id === b.teacherId)?.color || 'bg-slate-300'}`}></div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Agenda Detail View */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col min-h-[500px]">
        <div className="px-6 py-7 md:px-10 md:py-8 border-b border-slate-100 bg-white sticky top-0 z-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="hidden md:flex w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl items-center justify-center shadow-sm border border-indigo-100">
                <CalendarIcon size={24} />
             </div>
             <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">{displayDate}</h3>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">今日共有 {selectedDayBookings.length} 項預約</p>
             </div>
          </div>
          <button 
            onClick={() => onAddClick(selectedDay)}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-90"
            title="預約課室"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="flex-1 p-6 md:p-10 bg-slate-50/30">
          {selectedDayBookings.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl border border-slate-100 mb-6">
                 <Clock size={36} className="text-slate-200" />
               </div>
               <h4 className="text-xl font-black text-slate-400">課室目前空閒</h4>
               <p className="text-sm text-slate-400 font-bold mt-2">此時段尚無任何老師登記。</p>
               <button 
                onClick={() => onAddClick(selectedDay)}
                className="mt-6 px-6 py-3 bg-white text-indigo-600 font-black rounded-xl border border-indigo-100 shadow-sm hover:bg-indigo-50 transition-all text-xs uppercase tracking-widest"
               >
                 立即預約
               </button>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedDayBookings.map((b, index) => {
                const teacher = TEACHERS.find(t => t.id === b.teacherId) || TEACHERS[0];
                return (
                  <div key={b.id} className="relative flex group animate-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                    {/* Visual Timeline Path */}
                    {index !== selectedDayBookings.length - 1 && (
                       <div className="absolute left-[39px] top-16 bottom-0 w-0.5 bg-slate-200/50 hidden md:block"></div>
                    )}
                    
                    {/* Time Column */}
                    <div className="hidden md:flex flex-col items-center w-20 pt-2 shrink-0">
                      <span className="text-sm font-black text-slate-900">{b.startTime}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{b.endTime}</span>
                    </div>

                    {/* Session Card */}
                    <div className="flex-1 bg-white rounded-[1.75rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden relative">
                      {/* Subject Accent Bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-2 ${teacher.color}`}></div>
                      
                      <div className="flex-1 min-w-0 md:ml-2">
                        <div className="md:hidden flex items-center justify-between mb-3">
                           <div className="flex items-center gap-2 text-[11px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                             <Clock size={12} />
                             {b.startTime} — {b.endTime}
                           </div>
                           <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase ${b.type === BookingType.MONTHLY ? 'bg-slate-900 text-white' : 'bg-amber-100 text-amber-700'}`}>
                              {b.type === BookingType.MONTHLY ? '月堂' : '臨時'}
                           </span>
                        </div>

                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                           <span className={`text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-tight ${teacher.lightColor} ${teacher.textColor} border ${teacher.borderColor}`}>
                             {teacher.subject}
                           </span>
                           <span className="hidden md:inline-flex text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-tight bg-slate-900 text-white">
                             {b.type === BookingType.MONTHLY ? '月堂' : '臨時'}
                           </span>
                        </div>

                        <h4 className="text-xl md:text-2xl font-black text-slate-900 truncate leading-tight mb-2">
                          {b.title}
                        </h4>

                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full ${teacher.color} flex items-center justify-center text-white text-[10px] font-black shadow-inner`}>
                                {b.teacherName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-black text-slate-600">@{b.teacherName}</span>
                           </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 shrink-0 border-t border-slate-50 md:border-none pt-4 md:pt-0">
                         <button 
                          onClick={() => onDeleteBooking(b.id)}
                          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                         >
                           <Trash2 size={22} />
                         </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
