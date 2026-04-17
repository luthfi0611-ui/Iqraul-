import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSurahDetail, toggleBookmarkAyat, setLastRead } from '../features/quranSlice';
import { SkeletonAyat } from '../components/Skeleton';
import { 
  StarIcon as StarSolid, 
  BookOpenIcon, 
  ChevronLeftIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  ArrowPathIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

const Detail = () => {
  const { nomor } = useParams();
  const dispatch = useDispatch();
  
  // -- AUDIO & INTERACTIVE STATE --
  const [activeAyat, setActiveAyat] = useState(null); 
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const { detailSurah, loading, bookmarks, lastRead } = useSelector((state) => state.quran);

  useEffect(() => {
    dispatch(getSurahDetail(nomor));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [dispatch, nomor]);

  // -- LOGIC: PLAY SEQUENTIAL (Satu-satu tapi otomatis lanjut) --
  const handlePlaySurah = (startFrom = 1) => {
    const currentAyatData = detailSurah.ayat.find(a => a.nomorAyat === startFrom);
    
    if (currentAyatData) {
      if (audioRef.current) audioRef.current.pause();
      
      const audio = new Audio(currentAyatData.audio['05']);
      audioRef.current = audio;
      setActiveAyat(startFrom);
      setIsPlaying(true);
      
      // Auto Scroll ke ayat yang lagi dibaca
      const element = document.getElementById(`ayat-${startFrom}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      audio.play();

      audio.onended = () => {
        if (startFrom < detailSurah.jumlahAyat) {
          handlePlaySurah(startFrom + 1);
        } else {
          setIsPlaying(false);
          setActiveAyat(null);
        }
      };
    }
  };

  const toggleGlobalPlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setActiveAyat(null);
    } else {
      handlePlaySurah(activeAyat || 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 space-y-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {[...Array(3)].map((_, i) => <SkeletonAyat key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F9F6] dark:bg-[black] transition-colors duration-700 pb-32">
      
      {/* --- PREMIUM NAV BAR --- */}
      <nav className="sticky top-0 z-[100] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-b border-emerald-500/10 px-6 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="p-3 bg-white dark:bg-slate-800 shadow-lg rounded-2xl text-emerald-600 hover:scale-110 transition-all">
            <ChevronLeftIcon className="w-6 h-6" />
          </Link>
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
              {detailSurah?.namaLatin}
            </h2>
            <div className="flex items-center gap-2 justify-center">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">{detailSurah?.tempatTurun} • {detailSurah?.jumlahAyat} Ayat</p>
            </div>
          </div>
          <button className="p-3 bg-white dark:bg-slate-800 shadow-lg rounded-2xl text-emerald-600">
            <ArrowPathIcon className={`w-6 h-6 ${isPlaying ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </nav>

      {/* --- MEGA HERO HEADER --- */}
      <header className="max-w-5xl mx-auto px-6 pt-12 mb-20">
        <div className="relative group p-1 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 rounded-[4rem] shadow-2xl shadow-emerald-500/20">
          <div className="bg-white dark:bg-slate-900 rounded-[3.8rem] p-12 md:p-20 text-center relative overflow-hidden">
             {/* Ornament */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
             
             <h1 className="font-arabic text-7xl md:text-[10rem] mb-6 text-slate-900 dark:text-emerald-50 leading-none">{detailSurah?.nama}</h1>
             <p className="text-2xl md:text-4xl font-serif italic text-emerald-600 mb-8">{detailSurah?.namaLatin}</p>
             
             <div className="h-1 w-24 bg-emerald-500/20 mx-auto rounded-full mb-8"></div>
             <p className="max-w-md mx-auto text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
               "{detailSurah?.arti}. Surah yang diturunkan di kota {detailSurah?.tempatTurun}."
             </p>

             {/* Floating Play Button */}
             <button 
               onClick={toggleGlobalPlay}
               className="absolute bottom-10 right-10 md:right-20 w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-600/40 hover:scale-110 active:scale-95 transition-all group"
             >
                {isPlaying ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-10 h-10 ml-1" />}
                <div className="absolute inset-0 rounded-full bg-emerald-600 animate-ping opacity-20"></div>
             </button>
          </div>
        </div>
      </header>

      {/* --- AYAT CONTENT LIST --- */}
      <section className="max-w-5xl mx-auto px-6 space-y-10">
        {detailSurah?.ayat.map((ayat) => {
          const isHighlighted = activeAyat === ayat.nomorAyat;
          const isReadingThis = lastRead?.nomorAyat === ayat.nomorAyat && lastRead?.nomorSurah === nomor;
          const isBookmarked = bookmarks.ayat.some(b => b.nomorAyat === ayat.nomorAyat && b.surah === detailSurah.namaLatin);

          return (
            <div
              key={ayat.nomorAyat}
              id={`ayat-${ayat.nomorAyat}`}
              className={`relative group transition-all duration-700 ${isHighlighted ? 'z-50' : 'z-10'}`}
            >
              {/* Highlight Glow */}
              {isHighlighted && (
                <div className="absolute -inset-4 bg-emerald-500/10 dark:bg-emerald-500/5 blur-2xl rounded-[4rem] animate-pulse"></div>
              )}

              <div className={`relative bg-white dark:bg-slate-900 rounded-[3.5rem] p-8 md:p-14 border-2 transition-all duration-700 ${
                isHighlighted 
                  ? 'border-emerald-500 shadow-2xl shadow-emerald-500/20 scale-[1.02]' 
                  : 'border-white dark:border-slate-800 shadow-sm hover:shadow-xl'
              }`}>
                
                {/* Ayat Top Info */}
                <div className="flex justify-between items-center mb-12">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-500 ${
                      isHighlighted ? 'bg-emerald-600 text-white rotate-[360deg]' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {ayat.nomorAyat}
                    </div>
                    {isReadingThis && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <CheckBadgeIcon className="w-4 h-4" /> Terakhir Baca
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => dispatch(setLastRead({ nomorSurah: nomor, namaSurah: detailSurah.namaLatin, nomorAyat: ayat.nomorAyat }))}
                      className="p-4 rounded-2xl hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors text-slate-300 hover:text-emerald-500"
                    >
                      <BookOpenIcon className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => dispatch(toggleBookmarkAyat({ ...ayat, surah: detailSurah.namaLatin, nomorSurah: detailSurah.nomor }))}
                      className={`p-4 rounded-2xl transition-all ${isBookmarked ? 'text-yellow-500' : 'text-slate-300 hover:text-yellow-500'}`}
                    >
                      {isBookmarked ? <StarSolid className="w-6 h-6" /> : <StarOutline className="w-6 h-6" />}
                    </button>
                  </div>
                </div>

                {/* Arabic Text */}
                <div className="text-right mb-12">
                  <h2 className={`font-arabic text-5xl md:text-7xl leading-[1.8] transition-all duration-700 ${
                    isHighlighted ? 'text-emerald-600 dark:text-emerald-400 scale-105' : 'text-slate-800 dark:text-emerald-50/90'
                  }`} dir="rtl">
                    {ayat.teksArab}
                  </h2>
                </div>

                {/* Translation Box */}
                <div className="space-y-6 border-t border-slate-50 dark:border-slate-800/50 pt-10">
                   <p className="text-emerald-600/80 dark:text-emerald-400 font-bold italic text-lg leading-relaxed">
                     {ayat.teksLatin}
                   </p>
                   <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                     {ayat.teksIndonesia}
                   </p>
                </div>

                {/* Active Indicator Line */}
                {isHighlighted && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1.5 bg-emerald-500 rounded-t-full shadow-[0_-4px_10px_rgba(16,185,129,0.5)]"></div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* --- FLOATING MINI PLAYER (GLASSMOPHISM) --- */}
      {isPlaying && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[200] animate-in slide-in-from-bottom-10 duration-500">
           <div className="bg-slate-900/80 dark:bg-emerald-950/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white animate-spin-slow">
                    <SpeakerWaveIcon className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-white font-black text-xs uppercase tracking-widest">Memutar Ayat</p>
                    <p className="text-emerald-400 font-bold text-lg">{activeAyat} / {detailSurah.jumlahAyat}</p>
                 </div>
              </div>
              <button 
                onClick={toggleGlobalPlay}
                className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl"
              >
                 <PauseIcon className="w-7 h-7" />
              </button>
           </div>
        </div>
      )}

    </div>
  );
};

export default Detail;