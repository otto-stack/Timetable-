
import React, { useState, useEffect } from 'react';
import { Booking, BookingType, TEACHERS, LOCATIONS } from '../types';
import { MapPin, Video, Users, Mic, Briefcase } from 'lucide-react';

interface BookingFormProps {
  initialDate?: string;
  activeLocationId: 'yl' | 'mk';
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

const BookingForm: React.FC<BookingFormProps> = ({ initialDate, activeLocationId, onSubmit, onCancel }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100' 
        : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:border-slate-200'
    }`;

  return (
    <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-6 md:space-y-8 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        
        {/* Classroom Selection */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Classroom</label>
          <div className="grid grid-cols-2 gap-3">
            {LOCATIONS.map(loc => (
              <button
                key={loc.id}
                type="button"
                onClick={() => setFormData({...formData, locationId: loc.id as 'yl' | 'mk'})}
                className={optionItemClass(formData.locationId === loc.id)}
              >
                <MapPin size={18} className={formData.locationId === loc.id ? 'text-indigo-600' : 'text-slate-300'} />
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-black leading-none truncate">{loc.chineseName}</p>
                  <p className="text-[8px] md:text-[10px] font-bold opacity-60 uppercase truncate">{loc.name}</p>
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
          <div className="grid grid-cols-2 gap-3">
            {TEACHERS.map(teacher => (
              <button
                key={teacher.id}
                type="button"
                onClick={() => setFormData({...formData, teacherId: teacher.id})}
                className={`flex flex-col items-start gap-1 p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all text-left ${
                  formData.teacherId === teacher.id 
                    ? `${teacher.borderColor} ${teacher.lightColor} ring-4 ring-indigo-500/10 border-indigo-500` 
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden w-full">
                   <div className={`w-2 h-2 rounded-full ${teacher.color} flex-shrink-0 shadow-sm`}></div>
                   <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase truncate">{teacher.subject}</span>
                </div>
                <span className={`text-xs md:text-sm font-black truncate w-full ${formData.teacherId === teacher.id ? teacher.textColor : 'text-slate-600'}`}>
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
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Start</label>
            <input 
              type="time" 
              className="w-full px-4 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700 text-sm"
              value={formData.startTime}
              onChange={e => setFormData({...formData, startTime: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">End</label>
            <input 
              type="time" 
              className="w-full px-4 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700 text-sm"
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
          className="flex-[2] px-4 py-4 bg-indigo-600 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all uppercase tracking-widest text-[10px]"
        >
          Confirm
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
