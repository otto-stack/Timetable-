
import React from 'react';
import { Trash2, Clock, MapPin } from 'lucide-react';
import { Booking, BookingType, TEACHERS } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  bookings: Booking[];
  onDelete: (id: string) => void;
  locationName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ bookings, onDelete, locationName }) => {
  const sortedBookings = [...bookings].sort((a, b) => 
    new Date(a.date + ' ' + a.startTime).getTime() - new Date(b.date + ' ' + b.startTime).getTime()
  );

  const upcomingBookings = sortedBookings.filter(b => new Date(b.date) >= new Date(new Date().setHours(0,0,0,0)));

  const teacherUtilization = TEACHERS.map(teacher => {
    let color = '#64748b';
    if (teacher.color.includes('rose')) color = '#e11d48';
    if (teacher.color.includes('blue')) color = '#2563eb';
    if (teacher.color.includes('indigo')) color = '#4f46e5';
    if (teacher.color.includes('cyan')) color = '#0891b2';
    if (teacher.color.includes('amber')) color = '#d97706';
    if (teacher.color.includes('orange')) color = '#ea580c';
    if (teacher.color.includes('fuchsia')) color = '#c026d3';
    if (teacher.color.includes('emerald')) color = '#059669';

    return {
      name: teacher.name.split('.')[0],
      count: bookings.filter(b => b.teacherId === teacher.id).length,
      color: color
    };
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Stats Summary - Now at the top */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">總預約數</p>
          <p className="text-2xl md:text-4xl font-black text-slate-900">{bookings.length}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">常規月堂</p>
          <p className="text-2xl md:text-4xl font-black text-slate-900">{bookings.filter(b => b.type === BookingType.MONTHLY).length}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">臨時預約</p>
          <p className="text-2xl md:text-4xl font-black text-slate-900">{bookings.filter(b => b.type === BookingType.TEMPORARY).length}</p>
        </div>
        <div className="bg-slate-900 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200 flex items-center justify-center">
           <MapPin size={18} className="text-white mr-2" />
           <p className="text-lg md:text-xl font-black text-white">{locationName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* List Section */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl md:text-2xl font-black text-slate-900">
               即將到來的課程
               <span className="text-slate-300 font-medium ml-2 hidden md:inline">({locationName})</span>
            </h3>
            <span className="bg-emerald-500 px-3 md:px-4 py-1 rounded-full text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
               <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-white rounded-full animate-pulse"></div>
               LIVE
            </span>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            {upcomingBookings.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-10 md:p-16 text-center border border-slate-200 border-dashed">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                   <Clock size={24} />
                </div>
                <p className="text-slate-400 font-bold italic text-sm">目前尚無預約課程。</p>
              </div>
            ) : (
              upcomingBookings.map(b => {
                const teacher = TEACHERS.find(t => t.id === b.teacherId) || TEACHERS[0];
                return (
                  <div key={b.id} className="group bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex flex-col items-center justify-center font-black text-sm md:text-lg ${teacher.color} text-white shadow-lg flex-shrink-0`}>
                        <span>{new Date(b.date).getDate()}</span>
                        <span className="text-[8px] md:text-[10px] opacity-75 uppercase">{new Date(b.date).toLocaleString('zh-HK', { month: 'short' })}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base md:text-xl font-black text-slate-900 leading-tight truncate">
                          {b.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[10px] md:text-sm text-slate-500 font-bold">
                          <span className={`flex items-center gap-1 ${teacher.textColor}`}>@{b.teacherName.split('.')[0]}</span>
                          <span className="flex items-center gap-1"><Clock size={12} className="text-slate-400"/> {b.startTime}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${
                            b.type === BookingType.MONTHLY ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-white'
                          }`}>
                            {b.type === BookingType.MONTHLY ? '月堂' : '臨時'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDelete(b.id)}
                      className="p-3 text-slate-200 hover:text-red-500 transition-all flex-shrink-0"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-6 md:space-y-8">
           <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm h-fit">
             <h3 className="text-lg md:text-xl font-black text-slate-900 mb-6 md:mb-8">老師預約熱度</h3>
             <div className="h-60 md:h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={teacherUtilization} layout="vertical" margin={{ left: -20, right: 10 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                   <XAxis type="number" hide />
                   <YAxis 
                     dataKey="name" 
                     type="category" 
                     axisLine={false} 
                     tickLine={false} 
                     width={80} 
                     style={{ fontSize: '9px', fontWeight: '900', fill: '#94a3b8' }} 
                   />
                   <Tooltip 
                     cursor={{ fill: '#f8fafc' }}
                     contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '10px', fontSize: '10px' }}
                   />
                   <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={15}>
                     {teacherUtilization.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
