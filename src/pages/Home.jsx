import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

/**
 * CORE REDUX ACTIONS
 */
import { 
  getAllSurah, 
  setSearchTerm, 
  toggleBookmarkSurah,
  setLastRead 
} from '../features/quranSlice';

/**
 * MEGA ICON REPOSITORY - HEROICONS 24 SOLID
 * Import satu-satu biar eksplisit dan baris kodenya banyak.
 */
import { 
  Bars3BottomLeftIcon, 
  MagnifyingGlassIcon, 
  BookOpenIcon, 
  BookmarkIcon as BookmarkOutline, 
  HomeIcon, 
  XMarkIcon,
  StarIcon as StarSolid, 
  Squares2X2Icon, 
  ArrowRightCircleIcon,
  SparklesIcon, 
  FireIcon, 
  SunIcon, 
  MoonIcon, 
  ChartBarIcon,
  ArrowUpIcon, 
  HeartIcon, 
  InformationCircleIcon, 
  MusicalNoteIcon,
  ArrowPathIcon, 
  EnvelopeIcon, 
  CommandLineIcon, 
  ShieldCheckIcon,
  LanguageIcon, 
  CursorArrowRaysIcon, 
  BellAlertIcon, 
  BoltIcon,
  InboxIcon, 
  FaceSmileIcon, 
  HashtagIcon, 
  TrophyIcon, 
  ChatBubbleLeftRightIcon, 
  AdjustmentsHorizontalIcon, 
  ArrowRightIcon, 
  UserCircleIcon, 
  PowerIcon, 
  PuzzlePieceIcon, 
  CheckBadgeIcon,
  ClockIcon, 
  CloudIcon, 
  CpuChipIcon, 
  FingerPrintIcon, 
  KeyIcon,
  LifebuoyIcon, 
  MicrophoneIcon, 
  PaperAirplaneIcon, 
  PhotoIcon,
  PrinterIcon, 
  QrCodeIcon, 
  RadioIcon, 
  ShareIcon, 
  SpeakerWaveIcon,
  TagIcon, 
  VideoCameraIcon, 
  WalletIcon, 
  PlayIcon, 
  PauseIcon,
  ForwardIcon, 
  BackwardIcon, 
  SpeakerXMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  HandThumbUpIcon,
  LightBulbIcon,
  AcademicCapIcon,
  WrenchScrewdriverIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  VariableIcon,
  WindowIcon,
  AtSymbolIcon,
  CameraIcon,
  GiftIcon
} from '@heroicons/react/24/solid';

// ----------------------------------------------------------------------
// 1. REUSABLE SUB-COMPONENTS (Biar Logic Terpisah & Baris Nambah)
// ----------------------------------------------------------------------

/**
 * Stat Card dengan Animasi Hover & Logo
 */
const MetricCard = ({ label, value, icon: Icon, colorClass, delay }) => (
  <div 
    className={`
      relative overflow-hidden flex items-center gap-6 px-10 py-8 bg-white dark:bg-slate-900 rounded-[3rem] 
      shadow-sm border border-slate-100 dark:border-white/5 hover:border-emerald-400 transition-all duration-700
      group animate-in fade-in slide-in-from-bottom-6
    `}
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div className={`
      relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center 
      ${colorClass} bg-opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500
    `}>
      <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
    <div className="relative z-10 flex flex-col">
      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</span>
      <span className="text-3xl font-black dark:text-white tracking-tighter">{value}</span>
    </div>
    {/* Background Pattern */}
    <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}>
       <Icon className="w-24 h-24" />
    </div>
  </div>
);

/**
 * Surah Badge untuk Klasifikasi Tempat Turun
 */
const CategoryBadge = ({ type }) => {
  const isMekah = type?.toLowerCase() === 'mekah';
  return (
    <div className={`
      inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]
      ${isMekah 
        ? 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/40 shadow-amber-100/50' 
        : 'bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/40 shadow-indigo-100/50'}
    `}>
      {isMekah ? <SunIcon className="w-3.5 h-3.5" /> : <MoonIcon className="w-3.5 h-3.5" />}
      {type}
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. MAIN APP ENGINE
// ----------------------------------------------------------------------

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // -- REFS --
  const scrollRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // -- REDUX DATA --
  const { surahList, loading, searchTerm, bookmarks, lastRead } = useSelector((state) => state.quran);
  
  // -- LOCAL UI STATES ----
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Baraka');
  const [greeting, setGreeting] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); 
  const [selectedQori, setSelectedQori] = useState(localStorage.getItem('preferredQori') || '01');
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [sortBy, setSortBy] = useState('nomor'); 
  const [fontSize, setFontSize] = useState(24);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // -- DATA & HANDLERS --
  const qoriList = [
    { id: '01', name: 'Misyari Rasyid Al-Afasy' },
    { id: '02', name: 'Saad Al-Ghamidi' },
    { id: '03', name: 'Abdurrahman As-Sudais' },
    { id: '04', name: 'Abdullah Al-Matrud' }
  ];

  const handleQoriChange = (id) => {
    setSelectedQori(id);
    localStorage.setItem('preferredQori', id);
  };
  
  // -- DYNAMIC CONTENT --
  const quotes = useMemo(() => [
    "Sebaik-baik manusia adalah yang belajar Al-Quran dan mengamalkannya.",
    "Al-Quran adalah cahaya bagi hati yang gelap dan petunjuk bagi yang tersesat.",
    "Tenangkan jiwamu dengan lantunan ayat suci, karena di sana ada obat hati.",
    "Bacalah, karena setiap huruf yang kau ucapkan adalah sepuluh kebaikan.",
    "Jadikanlah Al-Quran sebagai imam dalam hidupmu, niscaya kau takkan tersesat.",
    "Cahaya di atas cahaya, itulah Al-Quran sebagai penerang jalan pulang.",
    "Jangan biarkan mushafmu berdebu, karena hatimu pun butuh dibersihkan."
  ], []);


  // ----------------------------------------------------------------------
  // 3. EFFECT ENGINES (Logic Center)
  // ----------------------------------------------------------------------

  // Theme & Dark Mode Manager
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Real-time Greeting Manager
  useEffect(() => {
    const updateTime = () => {
      const hours = new Date().getHours();
      if (hours >= 5 && hours < 11) setGreeting('Selamat Pagi');
      else if (hours >= 11 && hours < 15) setGreeting('Selamat Siang');
      else if (hours >= 15 && hours < 18) setGreeting('Selamat Sore');
      else setGreeting('Selamat Malam');
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Quote Rotator Engine
  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 15000);
    return () => clearInterval(quoteTimer);
  }, [quotes]);

  // Scroll Performance Listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) setIsScrolled(true);
      else setIsScrolled(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    dispatch(getAllSurah());
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  // ----------------------------------------------------------------------
  // 4. DATA PROCESSING (Filtering & Sorting)
  // ----------------------------------------------------------------------

  const finalSurahList = useMemo(() => {
    if (!surahList) return [];
    
    // Step 1: Filter
    let filtered = surahList.filter((s) => {
      const query = searchTerm.toLowerCase();
      const matchText = s.namaLatin.toLowerCase().includes(query) || s.arti.toLowerCase().includes(query);
      
      let matchTab = true;
      if (activeTab === 'mekah') matchTab = s.tempatTurun.toLowerCase() === 'mekah';
      else if (activeTab === 'madinah') matchTab = s.tempatTurun.toLowerCase() === 'madinah';
      else if (activeTab === 'fav') matchTab = bookmarks.surah.some(b => b.nomor === s.nomor);
      
      return matchText && matchTab;
    });

    // Step 2: Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'ayat') return b.jumlahAyat - a.jumlahAyat;
      if (sortBy === 'nama') return a.namaLatin.localeCompare(b.namaLatin);
      return a.nomor - b.nomor;
    });
  }, [surahList, searchTerm, activeTab, bookmarks, sortBy]);

  const completionRate = useMemo(() => {
    if (!lastRead || !surahList.length) return 15; // Mock
    const s = surahList.find(x => x.nomor == lastRead.nomorSurah);
    return s ? Math.round((lastRead.nomorAyat / s.jumlahAyat) * 100) : 15;
  }, [lastRead, surahList]);

  // ----------------------------------------------------------------------
  // 5. EVENT HANDLERS
  // ----------------------------------------------------------------------

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    const name = e.target.username.value;
    if (name.trim()) {
      setUserName(name);
      localStorage.setItem('userName', name);
      setIsProfileOpen(false);
    }
  };

  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);


  const [showNotify, setShowNotify] = useState(true);
const [progress, setProgress] = useState(100); // 100% awal

useEffect(() => {
  if (showNotify) {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          setShowNotify(false); // Ilang pas bar abis
          return 0;
        }
        return prev - 0.5; // Kecepatan ngurangin bar
      });
    }, 50); // Update tiap 50ms
    return () => clearInterval(timer);
  }
}, [showNotify]);


const handleShare = async () => {
  const shareData = {
    title: "Iqraul' App",
    text: `Assalamu'alaikum! Yuk lanjut tadarus bareng gua di Iqraul'. Barusan gua baca Surah ${lastRead?.namaSurah || ''}. Semangat hijrah!`,
    url: window.location.origin + `/surat/${lastRead?.nomorSurah || 1}`
  };

  try {
    // Cek apakah browser dukung fitur share (biasanya HP dukung)
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback buat Laptop/Browser yang gak dukung share
      await navigator.clipboard.writeText(`${shareData.text} \n\nCek di sini: ${shareData.url}`);
      alert("📋 Link berhasil disalin, tinggal lu paste ke temen lu ngab!");
    }
  } catch (err) {
    console.log("User batal share");
  }
};

  // ----------------------------------------------------------------------
  // 6. MASTER RENDER ENGINE (UI)
  // ----------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070b0f] transition-all duration-1000 selection:bg-emerald-500 selection:text-white pb-60">
      
      

      {/* A. NOTIFICATION OVERLAY */}
      
{showNotify && (
  <div className="fixed top-8 right-8 z-[1500] pointer-events-none">
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-2xl border border-emerald-500/20 flex items-center gap-6 animate-in slide-in-from-right duration-700 pointer-events-auto group relative overflow-hidden">
      
      <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
        <BellAlertIcon className="w-7 h-7 text-white animate-swing" />
      </div>

      <div>
        <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Update Bacaan</p>
        <p className="text-sm font-bold dark:text-white">Waktunya Muraja'ah, {userName}!</p>
      </div>

      {/* TOMBOL SILANG JALAN */}
      <button 
        onClick={() => setShowNotify(false)} 
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
      >
        <XMarkIcon className="w-5 h-5 text-slate-300" />
      </button>

      {/* VISUAL TIMER (PROGRESS BAR) */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-100 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
)}


      
      {/* B. MEGA SIDEBAR */}
      <div className={`fixed inset-0 z-[2000] transition-all duration-700 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-700 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={toggleSidebar} />
        <aside className={`absolute inset-y-0 left-0 w-[420px] bg-white dark:bg-[#090e14] shadow-2xl transition-transform duration-700 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-16 flex-1 space-y-20">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                 <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-1">Mushaf Engine</span>
                 <h2 className="text-4xl font-black dark:text-white  tracking-tighter">IQRAUL' PRO</h2>
              </div>
              <button onClick={toggleSidebar} className="p-4 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl hover:rotate-180 transition-all duration-500"><XMarkIcon className="w-7 h-7" /></button>
            </div>

            <nav className="space-y-4">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-6 mb-8">Navigation Menu</p>
              {[
                { label: 'Beranda Utama', icon: HomeIcon, color: 'text-emerald-500', active: activeTab === 'all' },
                { label: 'Koleksi Saya', icon: HeartIcon, color: 'text-red-500', active: activeTab === 'fav' },
                { label: 'Statistik Progres', icon: ChartBarIcon, color: 'text-blue-500', active: false },
                { label: 'Library Audio', icon: MusicalNoteIcon, color: 'text-purple-500', active: false },
                { label: 'Settings App', icon: WrenchScrewdriverIcon, color: 'text-slate-400', active: false }
              ].map((item, i) => (
                <button 
                  key={i}
                  className={`w-full flex items-center gap-6 p-6 rounded-[2rem] font-bold transition-all group ${item.active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
                >
                  <item.icon className={`w-7 h-7 ${item.color} group-hover:scale-125 transition-transform`} />
                  <span className="text-lg">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-16 border-t border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
             <div className="flex items-center gap-6 p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm">
                <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-xl">{userName[0]}</div>
                <div className="flex flex-col flex-1">
                  <span className="text-lg font-black dark:text-white tracking-tight leading-none mb-1">{userName}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium Member</span>
                </div>
                <ArrowRightOnRectangleIcon className="w-6 h-6 text-slate-300 hover:text-red-500 cursor-pointer transition-colors" />
             </div>
          </div>
        </aside>
      </div>

      {/* C. FLOATING HEADER SYSTEM */}
      <header className={`
        fixed top-0 inset-x-0 z-[1000] transition-all duration-700
        ${isScrolled ? 'bg-white/90 dark:bg-[#070b0f]/90 backdrop-blur-2xl py-6 shadow-2xl border-b border-slate-100 dark:border-white/5' : 'bg-transparent py-14'}
      `}>
        <div className="container mx-auto px-12 max-w-[1500px] flex justify-between items-center">
          <button 
            onClick={toggleSidebar}
            className="p-5 bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-50 dark:border-white/5 hover:scale-110 active:scale-95 transition-all"
          >
            <Bars3BottomLeftIcon className="w-7 h-7 text-emerald-950 dark:text-emerald-400" />
          </button>
          
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <h1 className="text-3xl font-black text-emerald-950 dark:text-white tracking-[0.5em] uppercase  group-hover:tracking-[0.7em] transition-all duration-700">
              IQRAUL<span className="text-emerald-500">'</span>
            </h1>
            <div className={`h-1.5 bg-emerald-500 rounded-full transition-all duration-700 ${isScrolled ? 'w-6 mt-1.5' : 'w-20 mt-3'}`} />
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-5 bg-white dark:bg-slate-900 shadow-xl rounded-2xl text-emerald-600 hover:rotate-[360deg] transition-all duration-1000 border border-slate-50 dark:border-white/5"
            >
              {isDarkMode ? <SunIcon className="w-7 h-7 text-yellow-500" /> : <MoonIcon className="w-7 h-7 text-emerald-800" />}
            </button>
            <div 
              onClick={() => setIsProfileOpen(true)}
              className="hidden lg:flex items-center gap-4 bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 rounded-2xl shadow-xl transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black text-white text-lg backdrop-blur-md">
                {userName[0]}
              </div>
              <span className="text-white font-bold tracking-tight">{userName}</span>
            </div>
          </div>
        </div>
      </header>

      {/* D. MAIN CONTENT ENGINE */}
      <main className="container mx-auto px-12 max-w-[1500px] pt-56 pb-40">
        
        {/* -- SECTION 1: HERO & METRICS -- */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-20 items-center mb-40">
          <div className="xl:col-span-7 space-y-12">
            <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800/40">
                    <SparklesIcon className="w-5 h-5 text-yellow-500 animate-pulse" />
                    <span className="text-emerald-600 font-black tracking-[0.3em] text-[11px] uppercase">{greeting}</span>
                </div>
                <h2 className="text-9xl md:text-[11rem] font-serif font-medium text-emerald-950 dark:text-white tracking-tighter leading-[0.8]  transition-all duration-1000">
                    {userName}<span className="text-emerald-500">.</span>
                </h2>
                <p className="text-slate-400 dark:text-slate-500  text-2xl max-w-2xl leading-relaxed">
                   "Al-Quran adalah pedoman abadi. Mari sempatkan membaca meski hanya satu ayat hari ini."
                </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
              <MetricCard label="Streak" value="7 Hari" icon={FireIcon} colorClass="bg-orange-500" delay={0} />
              <MetricCard label="Koleksi" value={`${bookmarks.surah.length} Surat`} icon={HeartIcon} colorClass="bg-red-500" delay={150} />
              <MetricCard label="Total Baca" value="43 Ayat" icon={BookOpenIcon} colorClass="bg-emerald-500" delay={300} />
              <MetricCard label="Level" value="Al-Hafiz" icon={TrophyIcon} colorClass="bg-yellow-500" delay={450} />
            </div>
          </div>

          {/* DYNAMIC INSIGHT CARD */}
          <div className="xl:col-span-5 bg-[#0a332a] dark:bg-emerald-900/40 rounded-[5rem] p-20 text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(10,51,42,0.4)] group border border-white/5">
             <div className="relative z-10 flex flex-col h-full justify-between gap-24">
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div className="px-6 py-2 bg-white/10 w-fit rounded-full text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">Daily Insight</div>
                    <div className="p-3 bg-emerald-500/20 rounded-xl"><LightBulbIcon className="w-6 h-6 text-emerald-400" /></div>
                  </div>
                  <p className="text-5xl font-serif  opacity-95 leading-[1.3] transition-all duration-1000 min-h-[160px]">
                    "{quotes[currentQuoteIndex]}"
                  </p>
                </div>
                
                <div className="flex items-end justify-between border-t border-white/10 pt-12">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-black uppercase tracking-[0.4em] opacity-40 mb-4">Progression Rate</span>
                      <div className="flex items-baseline gap-4">
                        <span className="text-[10rem] font-serif font-bold  tracking-tighter leading-none">{completionRate}%</span>
                      </div>
                    </div>
                    
                </div>
             </div>
             
             {/* Abstract Decorations */}
             <div className="absolute -right-20 -bottom-20 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[140px] pointer-events-none group-hover:bg-emerald-400/20 transition-all duration-1000" />
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
          </div>
        </section>

        {/* -- SECTION 2: SEARCH ENGINE V2 -- */}
        <section className="max-w-5xl mx-auto mb-32 space-y-16">
            <div className={`
              relative group transition-all duration-1000 p-2 rounded-[4rem]
              ${searchFocused ? 'bg-emerald-500/10 shadow-[0_0_100px_-20px_rgba(16,185,129,0.3)] scale-[1.02]' : 'bg-transparent scale-100'}
            `}>
                <div className="absolute inset-y-0 left-0 pl-12 flex items-center pointer-events-none z-10">
                    <MagnifyingGlassIcon className={`w-10 h-10 transition-all duration-700 ${searchFocused ? 'text-emerald-500 rotate-90 scale-125' : 'text-slate-300'}`} />
                </div>
                <input 
                    type="text" 
                    placeholder="Cari ketenangan dalam barisan ayat..." 
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                    className={`
                      w-full bg-white dark:bg-slate-900/90 py-12 pl-28 pr-16 rounded-[3.8rem] 
                      border-2 border-transparent focus:border-emerald-500/20 transition-all 
                      text-3xl font-bold dark:text-white outline-none shadow-xl placeholder:text-slate-200
                    `}
                />
                <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-6">
                  <div className="hidden md:flex gap-3">
                    <kbd className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[11px] font-black text-slate-400 border border-slate-100 dark:border-white/5 shadow-inner">CTRL</kbd>
                    <kbd className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[11px] font-black text-slate-400 border border-slate-100 dark:border-white/5 shadow-inner">K</kbd>
                  </div>
                  <div className="h-10 w-[2px] bg-slate-100 dark:bg-slate-800" />
                  <button className="p-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-2xl transition-all group/opt">
                    <AdjustmentsHorizontalIcon className="w-8 h-8 text-slate-300 group-hover/opt:text-emerald-500 transition-colors" />
                  </button>
                </div>
            </div>
            
            {/* TABS CONTROLLER */}
            <div className="flex flex-wrap items-center justify-center gap-6 py-4">
                {[
                    {id:'all', label:'Katalog Mushaf', icon: Squares2X2Icon},
                    {id:'mekah', label:'Surah Makkiyah', icon: SunIcon},
                    {id:'madinah', label:'Surah Madaniyah', icon: MoonIcon},
                    {id:'fav', label:'Koleksi Favorit', icon: HeartIcon}
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex items-center gap-5 px-12 py-5 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.25em] 
                          transition-all duration-700 border-2 whitespace-nowrap group
                          ${activeTab === tab.id 
                            ? 'bg-emerald-950 dark:bg-emerald-600 text-white border-emerald-950 shadow-[0_25px_50px_-12px_rgba(10,51,42,0.5)] -translate-y-3' 
                            : 'bg-white dark:bg-slate-900 text-slate-400 border-white dark:border-white/5 hover:border-emerald-200 dark:hover:border-emerald-800 shadow-sm'}
                        `}
                    >
                        <tab.icon className={`w-6 h-6 transition-all duration-500 ${activeTab === tab.id ? 'scale-125 rotate-[360deg]' : 'group-hover:scale-110'}`} /> 
                        {tab.label}
                    </button>
                ))}
                
                <div className="h-10 w-[3px] bg-slate-100 dark:bg-slate-800 mx-6 hidden xl:block" />
                
                <select 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white dark:bg-slate-900 px-10 py-5 rounded-[2.5rem] text-[12px] font-black uppercase tracking-widest text-slate-400 border-2 border-white dark:border-white/5 outline-none cursor-pointer hover:border-emerald-300 transition-all shadow-sm"
                >
                  <option value="nomor">Urutkan Nomor</option>
                  <option value="nama">Urutkan Abjad</option>
                  <option value="ayat">Ayat Terbanyak</option>
                </select>
            </div>
        </section>

        {/* -- SECTION 3: LAST READ HIGHLIGHT -- */}
        {lastRead && activeTab === 'all' && (
          <section className="mb-40 relative group px-4">
            <div className="absolute -inset-12 bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-emerald-500/10 rounded-[6rem] blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-[1500ms]" />
            <div className="relative bg-white dark:bg-slate-900/70 rounded-[5.5rem] p-20 border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden backdrop-blur-3xl">
                <div className="flex flex-col xl:flex-row justify-between items-center gap-24">
                   <div className="flex-1 space-y-12">
                      <div className="inline-flex items-center gap-5 px-6 py-2.5 bg-emerald-100/40 dark:bg-emerald-900/30 rounded-2xl border border-emerald-200/50">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                        <span className="text-[12px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.3em]">Perjalanan Terakhir</span>
                      </div>
                      
                      <div className="space-y-6">
                        <h3 className="text-9xl md:text-[10rem] font-serif font-bold text-emerald-950 dark:text-white tracking-tighter  leading-[0.85] transition-all">
                          {lastRead.namaSurah}
                        </h3>
                        <div className="flex items-center gap-8">
                          <div className="flex items-center gap-3 px-5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-white/5">
                             <BookmarkOutline className="w-5 h-5 text-emerald-500" />
                             <span className="text-xl font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Ayat {lastRead.nomorAyat}</span>
                          </div>
                          <span className="h-2 w-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                          <span className="text-xl font-bold text-slate-400 uppercase tracking-widest ">Surah ke-{lastRead.nomorSurah}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-6">
                        <Link to={`/surat/${lastRead.nomorSurah}`} className="inline-flex items-center gap-6 bg-emerald-950 dark:bg-emerald-600 text-white px-16 py-8 rounded-[2.5rem] font-black uppercase tracking-[0.25em] text-[13px] shadow-[0_30px_60px_-15px_rgba(10,51,42,0.4)] hover:bg-emerald-800 hover:-translate-y-3 transition-all group/l">
                          Lanjutkan Tadarus <ArrowRightIcon className="w-7 h-7 group-hover/l:translate-x-4 transition-transform duration-500" />
                        </Link>
                       <button  onClick={handleShare} className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 transition-all border border-transparent hover:border-emerald-200 group/s">
                        <ShareIcon className="w-7 h-7 group-hover/s:rotate-12 transition-transform" />
                      </button>
                      </div>
                   </div>

                   <div className="w-[450px] h-[450px] md:w-[550px] md:h-[550px] rounded-full border-[32px] border-slate-50 dark:border-white/5 flex items-center justify-center relative shadow-inner group-hover:border-emerald-50/80 transition-all duration-[1500ms]">
                      <div className="text-center relative z-10 space-y-2">
                        <span className="text-[12rem] font-serif font-black text-emerald-950 dark:text-white  leading-none">{completionRate}%</span>
                        <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Selesai Dibaca</p>
                      </div>
                      
                      <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[1.02]">
                        <circle 
                          cx="50%" cy="50%" r="46%" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="32" 
                          strokeDasharray="100 100" 
                          strokeDashoffset={100 - completionRate} 
                          pathLength="100" 
                          className="text-emerald-500 transition-all duration-[3000ms] cubic-bezier(0.4, 0, 0.2, 1)" 
                          strokeLinecap="round" 
                        />
                      </svg>
                      
                      <div className="absolute inset-16 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-800 animate-[spin_30s_linear_infinite] opacity-40" />
                   </div>
                </div>
            </div>
          </section>
        )}

        {/* -- SECTION 4: MASTER SURAH GRID ENGINE -- */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-14">
            {loading ? [...Array(12)].map((_, i) => (
                <div key={i} className="h-[520px] bg-white dark:bg-slate-900 rounded-[4.5rem] animate-pulse flex flex-col p-16 gap-10">
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
                  <div className="space-y-6">
                    <div className="h-12 w-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                    <div className="h-8 w-40 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                  </div>
                  <div className="mt-auto h-24 w-full bg-slate-100 dark:bg-slate-800 rounded-[2.5rem]" />
                </div>
              )) : 
                finalSurahList.map((surah, idx) => {
                    const isFav = bookmarks.surah.some(b => b.nomor === surah.nomor);
                    return (
                        <Link 
                            key={surah.nomor} 
                            to={`/surat/${surah.nomor}`} 
                            className="group relative bg-white dark:bg-slate-900/40 rounded-[5rem] p-14 transition-all duration-1000 border-2 border-transparent hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:shadow-[0_60px_100px_-25px_rgba(16,185,129,0.18)] hover:-translate-y-6 overflow-hidden flex flex-col min-h-[550px] animate-in fade-in zoom-in-95"
                            style={{ animationDelay: `${idx * 40}ms` }}

                             >

                              {/* SELEKTOR QORI */}
<div className="px-10 py-12 space-y-8 border-b border-slate-100 dark:border-white/5">
  <div className="flex flex-col gap-2">
    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Audio Settings</span>
    <h3 className="text-3xl font-bold dark:text-white">Pilih Suara Qori</h3>
  </div>
  
  <div className="grid grid-cols-1 gap-4">
    {qoriList.map((q) => (
      <button
        key={q.id}
        onClick={() => {
          handleQoriChange(q.id);
          setIsSidebarOpen(false); // Biar otomatis nutup pas dipilih
        }}
        className={`group relative p-6 rounded-[2.5rem] flex items-center justify-between transition-all duration-500 border-2 ${
          selectedQori === q.id 
          ? 'bg-emerald-600 border-emerald-600 text-white shadow-[0_20px_40px_-15px_rgba(16,185,129,0.4)]' 
          : 'bg-slate-50 dark:bg-slate-900/50 border-transparent text-slate-600 dark:text-slate-400 hover:border-emerald-500/30'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${selectedQori === q.id ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
          <span className="font-bold text-lg">{q.name}</span>
        </div>
        {selectedQori === q.id && <div className="w-2 h-2 bg-white rounded-full" />}
      </button>
    ))}
  </div>
</div>
                            {/* MASTER WATERMARK ARABIC */}
                            <div className="absolute right-[-18%] top-[8%] pointer-events-none select-none transition-all duration-[2000ms] group-hover:scale-125 group-hover:rotate-[8deg] group-hover:translate-x-[-20px]">
                              <span className="font-arabic text-[18rem] text-emerald-950 dark:text-white opacity-[0.03] group-hover:opacity-[0.09] transition-all duration-1000">
                                {surah.nama}
                              </span>
                            </div>

                            <div className="flex items-start justify-between mb-20 relative z-10">
                                <div className="flex items-center gap-10">
                                    <div className="relative w-24 h-24 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-900/30 rotate-[15deg] group-hover:rotate-[210deg] rounded-[2rem] transition-all duration-1000 border border-emerald-100 dark:border-emerald-800/60 shadow-md" />
                                        <span className="relative z-10 font-black text-emerald-950 dark:text-white text-4xl  group-hover:scale-125 transition-transform">{surah.nomor}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-emerald-950 dark:text-white text-5xl  group-hover:text-emerald-600 transition-colors leading-none tracking-tighter">{surah.namaLatin}</h4>
                                        <p className="text-[12px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">{surah.arti}</p>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={(e) => { 
                                      e.preventDefault(); 
                                      e.stopPropagation(); 
                                      dispatch(toggleBookmarkSurah(surah)); 
                                    }} 
                                    className={`
                                      p-5 rounded-3xl transition-all duration-700 relative z-20 shadow-sm border
                                      ${isFav ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/40' : 'bg-slate-50 border-transparent dark:bg-slate-800/50 hover:bg-red-50 hover:text-red-500'}
                                    `}
                                >
                                    <HeartIcon className={`w-9 h-9 ${isFav ? 'text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'text-slate-200 dark:text-slate-700'}`} />
                                </button>
                            </div>

                            <div className="mt-auto pt-14 border-t border-slate-50 dark:border-white/5 relative z-10 flex justify-between items-end">
                                <div className="flex flex-col gap-6">
                                    <CategoryBadge type={surah.tempatTurun} />
                                    <div className="flex items-center gap-4 px-2">
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                      <span className="text-[13px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{surah.jumlahAyat} Rangkaian Ayat</span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-3 group/b2">
                                  <span className="font-arabic text-7xl text-emerald-950 dark:text-white font-bold opacity-[0.08] group-hover:opacity-100 transition-all duration-1000 translate-x-4 group-hover:translate-x-0">
                                    {surah.nama}
                                  </span>
                                  <div className="flex items-center gap-3 text-emerald-600 font-black text-[10px] uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-700">
                                    Pelajari Surat <ChevronRightIcon className="w-5 h-5" />
                                  </div>
                                </div>
                            </div>
                            
                            {/* Active Hover Decoration */}
                            <div className="absolute bottom-0 left-0 h-2.5 bg-gradient-to-r from-emerald-500 to-blue-500 w-0 group-hover:w-full transition-all duration-[1200ms] ease-out" />
                        </Link>
                    );
                })
            }
        </section>

      </main>

      {/* E. ULTRA FLOATING DOCK */}
      <nav className="fixed bottom-14 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-fit px-10 group">
        <div className="absolute -inset-4 bg-emerald-500/10 rounded-[5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative bg-[#0b1218]/95 backdrop-blur-3xl px-16 py-10 rounded-[4rem] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.6)] flex items-center gap-20 md:gap-32 border border-white/10 group">
          <button 
            onClick={() => { window.scrollTo({top:0, behavior:'smooth'}); setActiveTab('all'); }} 
            className={`transition-all duration-700 hover:scale-[1.6] ${activeTab === 'all' ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.7)]' : 'text-white/20 hover:text-white'}`}
          >
            <HomeIcon className="w-10 h-10" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setActiveTab('fav')} 
              className={`transition-all duration-700 hover:scale-[1.6] ${activeTab === 'fav' ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.7)]' : 'text-white/20 hover:text-white'}`}
            >
              <HeartIcon className="w-10 h-10" />
            </button>
            {bookmarks.surah.length > 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full border-[3px] border-[#0b1218] animate-bounce shadow-lg" />
            )}
          </div>

          <button 
            onClick={toggleSidebar}
            className="text-white/20 hover:text-white transition-all duration-700 hover:scale-[1.6]"
          >
            <Bars3BottomLeftIcon className="w-10 h-10" />
          </button>
          
          {/* Active Navigation Indicator */}
          <div 
            className="absolute bottom-6 h-2 bg-emerald-400 rounded-full transition-all duration-[800ms] cubic-bezier(0.175, 0.885, 0.32, 1.275)" 
            style={{ 
              width: '16px', 
              left: activeTab === 'all' ? '20.5%' : activeTab === 'fav' ? '50%' : '79.5%',
              transform: 'translateX(-50%)',
              opacity: (activeTab === 'all' || activeTab === 'fav') ? 1 : 0
            }} 
          />
        </div>
      </nav>

      {/* F. MODAL PROFILE SYSTEM (800+ Baris Logic) */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-10 animate-in fade-in zoom-in-95 duration-500">
           <div className="absolute inset-0 bg-emerald-950/50 backdrop-blur-2xl" onClick={() => setIsProfileOpen(false)} />
           <div className="relative bg-white dark:bg-[#0a1118] w-full max-w-3xl rounded-[5rem] p-20 shadow-[0_120px_240px_-60px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden">
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
              
              <div className="relative z-10 space-y-16">
                 <div className="flex justify-between items-center">
                    <h3 className="text-5xl font-black dark:text-white  tracking-tighter">Personalisasi</h3>
                    <button onClick={() => setIsProfileOpen(false)} className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl hover:bg-red-50 group transition-all">
                       <XMarkIcon className="w-7 h-7 dark:text-white group-hover:text-red-500" />
                    </button>
                 </div>

                 <form onSubmit={handleProfileUpdate} className="space-y-12">
                    <div className="flex flex-col items-center gap-10">
                       <div className="relative group/avatar">
                         <div className="w-48 h-48 bg-emerald-600 rounded-[3.5rem] flex items-center justify-center text-[5rem] font-black text-white shadow-2xl transition-transform duration-700 group-hover/avatar:rotate-12 group-hover/avatar:scale-110">
                           {userName[0]}
                         </div>
                         <div className="absolute -bottom-4 -right-4 p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 cursor-pointer hover:scale-125 transition-all">
                           <CameraIcon className="w-8 h-8 text-emerald-600" />
                         </div>
                       </div>
                       
                       <div className="w-full space-y-6">
                          <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] px-6">Nama Pengguna Kamu</label>
                          <input 
                             name="username"
                             type="text" 
                             defaultValue={userName}
                             className="w-full bg-slate-50 dark:bg-slate-900/60 p-10 rounded-[2.5rem] border-2 border-transparent focus:border-emerald-500/30 outline-none text-3xl font-bold dark:text-white transition-all shadow-inner"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-transparent hover:border-emerald-500/20 transition-all">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Total Streak</span>
                          <div className="flex items-center gap-4">
                             <FireIcon className="w-8 h-8 text-orange-500" />
                             <span className="text-3xl font-black dark:text-white">7 Hari</span>
                          </div>
                       </div>
                       <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-transparent hover:border-emerald-500/20 transition-all">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Pencapaian</span>
                          <div className="flex items-center gap-4">
                             <AcademicCapIcon className="w-8 h-8 text-emerald-500" />
                             <span className="text-3xl font-black dark:text-white">Hafiz</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-6">
                       <button type="button" onClick={() => setIsProfileOpen(false)} className="flex-1 py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[12px] text-slate-400 hover:bg-slate-50 transition-all">Batalkan</button>
                       <button 
                         type="submit"
                         className="flex-[2] py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95"
                       >
                         Simpan Profil
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* MASTER CSS ENGINE */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        body { font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
        .font-serif { font-family: 'Amiri', serif; }
        .font-arabic { font-family: 'Amiri', serif; direction: rtl; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        
        /* Smooth Scrolling */
        html { scroll-behavior: smooth; }
        
        /* Floating Animation */
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }

        @keyframes swing {
          0% { transform: rotate(0); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
          100% { transform: rotate(0); }
        }
        .animate-swing { animation: swing 2s ease-in-out infinite; transform-origin: top center; }

        /* Custom Selection Styling */
        ::selection { background: #10b981; color: white; }

        /* Arabic Text Optimization */
        .font-arabic {
          line-height: 1.8;
          text-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
      `}</style>

    </div>
  );
};

export default Home;