
import React, { useState, useEffect, useMemo } from 'react';
import { Booking, BookingType, TEACHERS, LOCATIONS } from '../types';
import { MapPin, Video, Users, Mic, Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BookingFormProps {
  initialDate?: string;
  activeLocationId: 'yl' | 'mk';
  existingBookings: Booking[];
  onSubmit: (booking: Booking) => void;
  onCancel: () => void;
}

const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const SESSION_OPTIONS = [
  { id: 'live', label: 'Live Class', chinese: '實體課', icon: Mic },
  { id: 'video', label: 'Video Recording', chinese: '錄像課程', icon: Video },
  { id: 'tutorial', label: 'Tutorial', chinese: '小組輔導', icon: Users },
  { id: 'meeting', label: 'Meeting', chinese: '內部會議', icon: Briefcase },
];

const BookingForm: React.FC<BookingFormProps> = ({ initialDate, activeLocationId, existingBookings, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: SESSION_OPTIONS[0].label,
    teacherId: TEACHERS[0].id,
    locationId: activeLocationId,
    date: initialDate || getLocalDateString(),
    startTime: '09:00',
    endTime: '11:00',
    type: BookingType.MONTHLY,
    description: ''
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, locationId: activeLocationId }));
  }, [activeLocationId]);

  // Conflict Detection Logic - STRICTLY Filtered by Location
  // Overlaps in different locations are permitted
  const conflictingBooking = useMemo(() => {
    return existingBookings.find(b => {
      // Must be SAME location AND SAME date to be a conflict
      if (b.locationId !== formData.locationId || b.date !== formData.date) return false;
      
      // Overlap logic: (StartA < EndB) and (EndA > StartB)
      const startA = formData.startTime;
      const endA = formData.endTime;
      const startB = b.startTime;
      const endB = b.endTime;
      
      return startA < endB && endA > startB;
    });
  }, [formData, existingBookings]);

  const currentLocation = LOCATIONS.find(l => l.id === formData.locationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflictingBooking) return; 
    if (!formData.title || !formData.teacherId || !formData.locationId) return;

    const teacher = TEACHERS.find(t => t.id === formData.teacherId)!;

    onSubmit({
      ...formData,
      id: crypto.randomUUID(),
      teacherName: teacher.name,
      locationId: formData.locationId,
    });
  };

  const optionItemClass = (active: boolean) =>
    `flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all text-left ${
      active 
        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100 shadow-sm' 
        : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:border-slate-200'
    }`;

  return (
    <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-6 md:space-y-8 bg-white">
      {/* Dynamic Alert Banner */}
      {conflictingBooking ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-black text-rose-800">
              {currentLocation?.chineseName}分校 預約衝突 (Time Clash)
            </h4>
            <p className="text-xs text-rose-700 font-medium mt-1 leading-relaxed">
              此時段已被 <span className="font-black">@{conflictingBooking.teacherName}</span> 登記。
              <br/>
              <span className="opacity-80">💡 不同分校的預約互不干擾，請檢查是否選錯了地點。</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
          <p className="text-xs text-emerald-700 font-black uppercase tracking-wider">
            {currentLocation?.chineseName}分校 該時段目前可用
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        
        {/* Classroom Selection */}
        <div className="col-span-1 md:col-span-2">
          <label className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Classroom</span>
            <span className="text-[9px] font-bold text-indigo-400 italic">分校預約互不影響</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {LOCATIONS.map(loc => (
              <button
                key={loc.id}
                type="button"
                onClick={() => setFormData({...formData, locationId: loc.id as 'yl' | 'mk'})}
                className={optionItemClass(formData.locationId === loc.id)}
              >
                <div className={`p-1.5 rounded-lg ${formData.locationId === loc.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  <MapPin size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-black leading-none truncate">{loc.chineseName}</p>
                  <p className="text-[8px] md:text-[10px] font-bold opacity-60 uppercase truncate">{loc.name} Campus</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Session Title Options */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Session Type</label>
          <div className="grid grid-cols-2 gap-3">
            {SESSION_OPTIONS.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFormData({...formData, title: option.label})}
                className={optionItemClass(formData.title === option.label)}
              >
                <option.icon size={18} className={formData.title === option.label ? 'text-indigo-600' : 'text-slate-400'} />
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-black leading-none truncate">{option.chinese}</p>
                  <p className="text-[8px] md:text-[10px] font-bold opacity-60 uppercase truncate">{option.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Tutor Selection */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Select Tutor</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {TEACHERS.map(teacher => (
              <button
                key={teacher.id}
                type="button"
                onClick={() => setFormData({...formData, teacherId: teacher.id})}
                className={`flex flex-col items-start gap-1 p-3 rounded-xl border transition-all text-left ${
                  formData.teacherId === teacher.id 
                    ? `${teacher.borderColor} ${teacher.lightColor} ring-2 ring-indigo-500/10 border-indigo-500` 
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden w-full">
                   <div className={`w-1.5 h-1.5 rounded-full ${teacher.color} flex-shrink-0 shadow-sm`}></div>
                   <span className="text-[8px] font-black text-slate-400 uppercase truncate">{teacher.subject}</span>
                </div>
                <span className={`text-[11px] font-black truncate w-full ${formData.teacherId === teacher.id ? teacher.textColor : 'text-slate-600'}`}>
                  @{teacher.name.split('.')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
          <select 
            className="w-full px-4 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-black text-slate-700 text-sm"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value as BookingType})}
          >
            <option value={BookingType.MONTHLY}>Monthly (月堂)</option>
            <option value={BookingType.TEMPORARY}>Temporary (臨時)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
          <input 
            type="date" 
            className="w-full px-4 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700 text-sm"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 col-span-1 md:col-span-2">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Start Time</label>
            <input 
              type="time" 
              className={`w-full px-4 py-3 md:py-4 rounded-xl md:rounded-2xl border outline-none transition-all font-bold text-slate-700 text-sm ${
                conflictingBooking ? 'border-rose-300 bg-rose-50 focus:ring-rose-500' : 'border-slate-200 bg-slate-50 focus:ring-indigo-500'
              }`}
              value={formData.startTime}
              onChange={e => setFormData({...formData, startTime: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">End Time</label>
            <input 
              type="time" 
              className={`w-full px-4 py-3 md:py-4 rounded-xl md:rounded-2xl border outline-none transition-all font-bold text-slate-700 text-sm ${
                conflictingBooking ? 'border-rose-300 bg-rose-50 focus:ring-rose-500' : 'border-slate-200 bg-slate-50 focus:ring-indigo-500'
              }`}
              value={formData.endTime}
              onChange={e => setFormData({...formData, endTime: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-4 border border-slate-200 text-slate-500 font-black rounded-xl md:rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={!!conflictingBooking}
          className={`flex-[2] px-4 py-4 text-white font-black rounded-xl md:rounded-2xl shadow-xl transition-all uppercase tracking-widest text-[10px] ${
            conflictingBooking 
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700 active:scale-95'
          }`}
        >
          {conflictingBooking ? '時段已被佔用' : 'Confirm Booking'}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
