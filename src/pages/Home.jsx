import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bars3BottomLeftIcon, 
  MusicalNoteIcon, 
  SunIcon, 
  MoonIcon, 
  MagnifyingGlassIcon,
  XMarkIcon,
  SparklesIcon,
  HeartIcon,
  HomeIcon,
  FireIcon,
  BookOpenIcon,
  ClockIcon,
  Squares2X2Icon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const Home = () => {
  // --- 1. STATE & STORAGE ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [surahs, setSurahs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fitur Inti: Favorit & Terakhir Baca
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('fav_surah')) || []);
  const [lastRead, setLastRead] = useState(JSON.parse(localStorage.getItem('last_read')) || null);

  // --- 2. DARK MODE SYNC (BIAR DETAIL.JSX NYAMBUNG) ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // --- 3. DATA FETCHING ---
  useEffect(() => {
    fetch('https://equran.id/api/v2/surat')
      .then(res => res.json())
      .then(data => setSurahs(data.data || []))
      .catch(err => console.log("Gagal ambil data:", err));

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- 4. HANDLERS ---
  const toggleFavorite = (e, id) => {
    e.preventDefault(); // Biar gak ke-trigger navigasi Link
    const updated = favorites.includes(id) 
      ? favorites.filter(f => f !== id) 
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('fav_surah', JSON.stringify(updated));
  };

  const handleLastRead = (surah) => {
    const data = { nomor: surah.nomor, nama: surah.namaLatin };
    setLastRead(data);
    localStorage.setItem('last_read', JSON.stringify(data));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070b0f] transition-colors duration-500 pb-32">
      
      {/* HEADER - RESPONSIVE */}
      <header className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${isScrolled ? 'py-4 bg-white/90 dark:bg-[#070b0f]/90 backdrop-blur-xl shadow-lg' : 'py-8 bg-transparent'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center max-w-7xl">
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-md border dark:border-white/5 transition-transform active:scale-90">
            <Bars3BottomLeftIcon className="w-6 h-6 dark:text-emerald-400" />
          </button>
          <h1 className="text-xl md:text-2xl font-black dark:text-white tracking-[0.3em] uppercase select-none">IQRAUL<span className="text-emerald-500">'</span></h1>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-md border dark:border-white/5 transition-transform active:scale-90">
            {isDarkMode ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-emerald-800" />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-32 md:pt-44 max-w-7xl">
        
        {/* DASHBOARD HERO - RESPONSIVE */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          
          {/* Main Card (Terakhir Baca) */}
          <div className="lg:col-span-8 bg-emerald-950 rounded-[2.5rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <SparklesIcon className="w-5 h-5 text-yellow-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Selamat Tadarus</span>
                </div>
                <h2 className="text-6xl md:text-8xl font-black mb-10 tracking-tighter leading-none">Iqra<span className="text-emerald-500">.</span></h2>
              </div>

              {/* Tampilan Last Read yang Beneran Fungsi */}
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">Lanjutkan Bacaan</p>
                {lastRead ? (
                  <Link 
                    to={`/surat/${lastRead.nomor}`} 
                    className="inline-flex items-center gap-5 bg-white/10 hover:bg-white/20 p-5 rounded-[2rem] transition-all border border-white/10 group backdrop-blur-sm"
                  >
                    <div className="bg-emerald-500 p-3 rounded-xl group-hover:rotate-12 transition-transform">
                      <BookmarkIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{lastRead.nama}</p>
                      <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Surah Ke-{lastRead.nomor}</p>
                    </div>
                  </Link>
                ) : (
                  <div className="text-sm opacity-40 italic flex items-center gap-2">
                    <ClockIcon className="w-5 h-5" /> Belum ada riwayat bacaan.
                  </div>
                )}
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
          </div>

          {/* Quick Stats (Favorit & Streak) */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
             <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border dark:border-white/5 flex items-center gap-6">
                <div className="p-4 bg-orange-100 dark:bg-orange-500/10 rounded-2xl">
                   <FireIcon className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                   <p className="text-3xl font-black dark:text-white leading-none">7</p>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Hari Streak</p>
                </div>
             </div>
             
             <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border dark:border-white/5 flex items-center gap-6">
                <div className="p-4 bg-red-100 dark:bg-red-500/10 rounded-2xl">
                   <HeartSolid className="w-8 h-8 text-red-500" />
                </div>
                <div>
                   <p className="text-3xl font-black dark:text-white leading-none">{favorites.length}</p>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Favorit</p>
                </div>
             </div>
          </div>
        </section>

        {/* SEARCH BAR */}
        <div className="relative mb-16 max-w-4xl mx-auto">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-slate-300" />
          <input 
            type="text" 
            placeholder="Cari surah..." 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 py-7 pl-20 pr-8 rounded-[2.5rem] shadow-xl outline-none dark:text-white border-2 border-transparent focus:border-emerald-500/20 transition-all text-xl placeholder:text-slate-300"
          />
        </div>

        {/* LIST SURAH - RESPONSIVE GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {surahs
            .filter(s => s.namaLatin.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((surah) => (
            <Link 
              key={surah.nomor} 
              to={`/surat/${surah.nomor}`} 
              onClick={() => handleLastRead(surah)}
              className="group bg-white dark:bg-slate-900/40 p-10 rounded-[3rem] border border-transparent hover:border-emerald-500/20 transition-all duration-500 shadow-sm hover:shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]"
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center font-black text-emerald-600 dark:text-emerald-400 text-xl">
                    {surah.nomor}
                  </div>
                  <div>
                    <h4 className="font-black text-2xl dark:text-white group-hover:text-emerald-500 transition-colors tracking-tight">{surah.namaLatin}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{surah.arti}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => toggleFavorite(e, surah.nomor)} 
                  className={`p-3 rounded-xl transition-all ${favorites.includes(surah.nomor) ? 'bg-red-50 text-red-500 scale-110 shadow-sm' : 'text-slate-200 hover:text-red-400'}`}
                >
                  {favorites.includes(surah.nomor) ? <HeartSolid className="w-7 h-7" /> : <HeartIcon className="w-7 h-7" />}
                </button>
              </div>

              <div className="mt-12 flex justify-between items-end relative z-10 pt-8 border-t dark:border-white/5">
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{surah.tempatTurun}</p>
                  <p className="text-sm font-bold text-slate-400">{surah.jumlahAyat} Ayat</p>
                </div>
                <span className="text-6xl font-arabic font-bold text-emerald-950 dark:text-white opacity-[0.05] group-hover:opacity-100 transition-all duration-1000 transform group-hover:scale-110 leading-none select-none">
                  {surah.nama}
                </span>
              </div>
              
              <div className="absolute -inset-10 bg-emerald-500/5 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity pointer-events-none" />
            </Link>
          ))}
        </section>
      </main>

      {/* MOBILE BOTTOM NAV - RESPONSIVE */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-5 rounded-[2.5rem] flex justify-around shadow-[0_20px_50px_rgba(0,0,0,0.2)] border dark:border-white/10 md:hidden z-[1000]">
        <button className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/30"><HomeIcon className="w-7 h-7"/></button>
        <button className="p-4 text-slate-400" onClick={() => setIsSidebarOpen(true)}><Squares2X2Icon className="w-7 h-7"/></button>
        <button className="p-4 text-slate-400"><HeartIcon className="w-7 h-7"/></button>
      </nav>

      {/* GLOBAL STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&family=Amiri:wght@700&display=swap');
        
        body { 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          -webkit-tap-highlight-color: transparent;
        }
        
        .font-arabic { 
          font-family: 'Amiri', serif; 
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        
        .dark body { 
          background-color: #070b0f; 
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        main { animation: fadeIn 0.8s ease-out; }
      `}</style>
    </div>
  );
};

export default Home;