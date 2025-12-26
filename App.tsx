
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Calendar, LayoutDashboard, Plus, X, MapPin, AlertTriangle, 
  Globe, RefreshCw, Users, ShieldCheck, Menu, Settings
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import * as firestore from 'firebase/firestore';

import CalendarView from './components/CalendarView';
import Dashboard from './components/Dashboard';
import BookingForm from './components/BookingForm';
import { Booking, LOCATIONS } from './types';

const { getFirestore, doc, onSnapshot, setDoc } = firestore;

// ==========================================================
// 🔴 Firebase Config 已由用戶填寫 🔴
// ==========================================================
const firebaseConfig = {
  apiKey: "AIzaSyAt2KlfC9bP_wdEGMkorDP8YN1f4aaOMAw",
  authDomain: "classflow-d763f.firebaseapp.com",
  projectId: "classflow-d763f",
  storageBucket: "classflow-d763f.firebasestorage.app",
  messagingSenderId: "455074578528",
  appId: "1:455074578528:web:a74b0a92d43d648ef70305",
  measurementId: "G-V0YFSDBJHB"
};
// ==========================================================

const isFirebaseSetup = firebaseConfig.apiKey !== "YOUR_API_KEY";
const app = isFirebaseSetup ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;

const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const SetupGuide: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-600 p-6 text-white text-center">
    <div className="bg-white/10 backdrop-blur-md p-8 rounded-[3rem] border border-white/20 max-w-2xl shadow-2xl">
      <div className="w-20 h-20 bg-white text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
        <ShieldCheck size={40} />
      </div>
      <h2 className="text-3xl font-black mb-4 tracking-tight">最後一步：啟動雲端同步</h2>
      <p className="text-indigo-100 mb-10 font-medium">您已經成功建立專案！現在只需將 Firebase 的「通訊金鑰」貼入程式碼即可。</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-10">
        <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
          <p className="text-sm font-bold text-white">1. 點擊 ⚙️「專案設定」</p>
        </div>
        <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
          <p className="text-sm font-bold text-white">2. 點擊「 {'</>'} 」圖標</p>
        </div>
        <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
          <p className="text-sm font-bold text-white">3. 貼到 App.tsx 最上方</p>
        </div>
      </div>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('classflow_bookings_v2');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [syncKey, setSyncKey] = useState<string>(() => localStorage.getItem('classflow_sync_key') || 'LE');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [activeLocationId, setActiveLocationId] = useState<'yl' | 'mk'>('yl');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showSavePulse, setShowSavePulse] = useState(false);
  const [pendingDeletionId, setPendingDeletionId] = useState<string | null>(null);
  
  const locationPath = useLocation();

  useEffect(() => {
    localStorage.setItem('classflow_sync_key', syncKey);
    if (!db || !syncKey) return;

    setIsSyncing(true);
    try {
      const unsub = onSnapshot(doc(db, "groups", syncKey), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.bookings) {
            setBookings(data.bookings);
            localStorage.setItem('classflow_bookings_v2', JSON.stringify(data.bookings));
          }
        }
        setLastSynced(new Date());
        setIsSyncing(false);
        setSyncError(null);
        setShowSavePulse(true);
        setTimeout(() => setShowSavePulse(false), 2000);
      }, (error) => {
        setIsSyncing(false);
        setSyncError(error.code === 'permission-denied' ? "權限錯誤" : "連線不穩");
      });
      return () => unsub();
    } catch (err) {
      setIsSyncing(false);
    }
  }, [syncKey]);

  if (!isFirebaseSetup) return <SetupGuide />;

  const pushUpdateToCloud = async (newBookings: Booking[]) => {
    if (!db || !syncKey) return;
    try {
      setIsSyncing(true);
      await setDoc(doc(db, "groups", syncKey), { 
        bookings: newBookings,
        lastUpdated: new Date().toISOString()
      });
    } catch (e) {
      setSyncError("儲存失敗");
    } finally {
      setIsSyncing(false);
    }
  };

  const activeBookings = useMemo(() => 
    bookings.filter(b => b.locationId === activeLocationId),
    [bookings, activeLocationId]
  );

  const addBooking = (newBooking: Booking) => {
    // Final safety check for conflicts
    const hasConflict = bookings.some(b => 
      b.locationId === newBooking.locationId && 
      b.date === newBooking.date && 
      newBooking.startTime < b.endTime && 
      newBooking.endTime > b.startTime
    );

    if (hasConflict) {
      alert("⚠️ 此時段已有其他預約，請重新選擇。");
      return;
    }

    const updated = [...bookings, newBooking];
    setBookings(updated);
    setIsModalOpen(false);
    pushUpdateToCloud(updated);
  };

  const confirmDelete = () => {
    if (pendingDeletionId) {
      const updated = bookings.filter(b => b.id !== pendingDeletionId);
      setBookings(updated);
      setPendingDeletionId(null);
      pushUpdateToCloud(updated);
    }
  };

  const currentLocationName = LOCATIONS.find(l => l.id === activeLocationId)?.chineseName;
  const bookingToCancel = pendingDeletionId ? bookings.find(b => b.id === pendingDeletionId) : null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      
      {/* Mobile Header (Only on small screens) */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">C</div>
          <span className="font-black text-slate-900 tracking-tight">ClassFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveLocationId(activeLocationId === 'yl' ? 'mk' : 'yl')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-600 border border-slate-200"
          >
            <MapPin size={12} /> {currentLocationName}
          </button>
          <button onClick={() => setIsSyncModalOpen(true)} className="p-2 text-slate-400">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">
        <div className="p-8 pb-4 flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">C</div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ClassFlow</h1>
          </div>
          
          <nav className="space-y-2 mb-10">
            <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${locationPath.pathname === '/' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-indigo-50'}`}>
              <LayoutDashboard size={20} /> <span className="font-semibold">總覽儀表板</span>
            </Link>
            <Link to="/calendar" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${locationPath.pathname === '/calendar' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-indigo-50'}`}>
              <Calendar size={20} /> <span className="font-semibold">課室時間表</span>
            </Link>
          </nav>

          <div className="space-y-4 mb-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">同步群組</p>
            <div className={`p-4 rounded-2xl border ${syncError ? 'bg-rose-50 border-rose-100' : 'bg-indigo-50/50 border-indigo-100'}`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase ${syncError ? 'text-rose-600' : 'text-indigo-600'}`}>
                      {syncError ? '錯誤' : '即時同步'}
                    </span>
                    <RefreshCw size={12} className={`text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
                  </div>
                  <div onClick={() => setIsSyncModalOpen(true)} className="bg-white p-3 rounded-xl border border-indigo-100 text-sm font-black text-slate-800 flex items-center gap-2 justify-center cursor-pointer hover:shadow-md transition-all">
                    <Users size={16} className="text-indigo-400" /> {syncKey}
                  </div>
                </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">切換分校</p>
            <div className="bg-slate-100 p-1 rounded-2xl flex flex-col gap-1">
              {LOCATIONS.map(loc => (
                <button key={loc.id} onClick={() => setActiveLocationId(loc.id as 'yl' | 'mk')} className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm ${activeLocationId === loc.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
                  <span>{loc.chineseName}</span>
                  {activeLocationId === loc.id && <MapPin size={14} className="text-indigo-500 animate-bounce" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-5 bg-slate-50 border-t border-slate-100">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${showSavePulse ? 'bg-emerald-50 border-emerald-200 scale-[1.02]' : 'bg-white border-transparent shadow-sm'}`}>
            <ShieldCheck size={18} className={showSavePulse ? 'text-emerald-500' : 'text-slate-300'} />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tighter text-slate-900">
                {showSavePulse ? '同步成功' : '雲端正常'}
              </span>
              <span className="text-[9px] font-bold text-slate-400">
                {lastSynced ? `${lastSynced.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : '連線中...'}
              </span>
            </div>
          </div>
          <button onClick={() => { setSelectedDate(getLocalDateString()); setIsModalOpen(true); }} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 text-sm">
            <Plus size={18} /> 新增課室預約
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-5 md:p-8 pb-32 md:pb-8 overflow-y-auto">
        <header className="hidden md:flex mb-8 items-center justify-between">
          <div>
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-2">地點：{currentLocationName}</span>
            <h2 className="text-3xl font-black text-slate-900">課室預約管理系統</h2>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-slate-900 uppercase">{new Date().toLocaleDateString('zh-HK', { weekday: 'long' })}</p>
            <p className="text-xs text-slate-400 font-bold">{new Date().toLocaleDateString('zh-HK')}</p>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard bookings={activeBookings} onDelete={id => setPendingDeletionId(id)} locationName={currentLocationName || ''} />} />
          <Route path="/calendar" element={<CalendarView bookings={activeBookings} onDeleteBooking={id => setPendingDeletionId(id)} onAddClick={date => { setSelectedDate(date); setIsModalOpen(true); }} />} />
        </Routes>
      </main>

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-24 right-6 z-40">
        <button 
          onClick={() => { setSelectedDate(getLocalDateString()); setIsModalOpen(true); }}
          className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center animate-bounce ring-4 ring-white"
        >
          <Plus size={32} />
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-6 py-4 flex items-center justify-around z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <Link to="/" className={`flex flex-col items-center gap-1 transition-all ${locationPath.pathname === '/' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <LayoutDashboard size={22} />
          <span className="text-[10px] font-black uppercase tracking-tighter">總覽</span>
        </Link>
        <Link to="/calendar" className={`flex flex-col items-center gap-1 transition-all ${locationPath.pathname === '/calendar' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <Calendar size={22} />
          <span className="text-[10px] font-black uppercase tracking-tighter">時間表</span>
        </Link>
        <button onClick={() => setIsSyncModalOpen(true)} className="flex flex-col items-center gap-1 text-slate-400">
          <Users size={22} />
          <span className="text-[10px] font-black uppercase tracking-tighter">同步</span>
        </button>
      </nav>

      {/* Modals (Shared for Desktop/Mobile) */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6">
                <Globe size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">同步金鑰設定</h3>
              <p className="text-slate-500 text-sm font-medium mb-8">與其他老師輸入相同代碼即可共享課表。</p>
              <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-black text-slate-700 uppercase mb-8 text-center" value={syncKey} onChange={e => setSyncKey(e.target.value.toUpperCase())} />
              <button onClick={() => setIsSyncModalOpen(false)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg">完成</button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white rounded-t-[2.5rem] md:rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100">
              <div><h3 className="text-xl font-black text-slate-900">登記課室預約</h3></div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-600 p-2"><X size={28} /></button>
            </div>
            <div className="overflow-y-auto">
              <BookingForm 
                initialDate={selectedDate} 
                activeLocationId={activeLocationId} 
                existingBookings={bookings} 
                onSubmit={addBooking} 
                onCancel={() => setIsModalOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}

      {pendingDeletionId && bookingToCancel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">確定取消預約？</h3>
              <p className="text-slate-500 text-sm font-medium mb-8">確定要從所有人的畫面中移除「{bookingToCancel.title}」預約嗎？</p>
              <div className="space-y-3">
                <button onClick={confirmDelete} className="w-full py-4 bg-rose-500 text-white font-black rounded-2xl shadow-lg">確認取消</button>
                <button onClick={() => setPendingDeletionId(null)} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl">保留預約</button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
