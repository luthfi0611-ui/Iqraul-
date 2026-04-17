import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { StarIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { toggleBookmarkSurah, toggleBookmarkAyat } from '../features/quranSlice';

const Favorites = () => {
  const dispatch = useDispatch();
  const { bookmarks } = useSelector((state) => state.quran);

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 overflow-hidden">
      
      {/* --- DEKORASI BACKGROUND --- */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-yellow-100/30 dark:bg-yellow-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <Link 
            to="/" 
            className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold transition-all group w-fit"
          >
            <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:shadow-md group-hover:-translate-x-1 transition-all">
              <ArrowLeftIcon className="w-5 h-5" />
            </div>
            <span>Kembali ke Beranda</span>
          </Link>

          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-yellow-400 rounded-xl shadow-lg shadow-yellow-200 dark:shadow-none">
                <StarIcon className="w-6 h-6 text-white" /> 
            </div>
            Favorit <span className="text-emerald-600">Saya</span>
          </h1>
        </div>

        {/* --- SECTION SURAT FAVORIT --- */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <span className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">Koleksi Surat</span>
            <div className="h-[1px] flex-grow bg-slate-200 dark:bg-slate-800"></div>
          </div>

          {bookmarks.surah.length === 0 ? (
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-12 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-400 font-medium italic">Belum ada surat yang ditandai bintang.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {bookmarks.surah.map((s) => (
                <div key={s.nomor} className="relative group">
                  {/* Tombol Un-Bookmark Cepat */}
                  <button 
                    onClick={() => dispatch(toggleBookmarkSurah(s))}
                    className="absolute -top-2 -right-2 z-20 bg-white dark:bg-slate-700 shadow-md p-1.5 rounded-lg text-yellow-400 hover:text-red-500 transition-colors border border-slate-100 dark:border-slate-600"
                  >
                    <StarIcon className="w-4 h-4" />
                  </button>

                  <Link to={`/surat/${s.nomor}`}>
                    <div className="p-5 bg-white dark:bg-slate-800 rounded-[1.5rem] shadow-sm border border-transparent hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-100/50 dark:hover:shadow-none transition-all flex justify-between items-center overflow-hidden">
                      <div className="flex items-center gap-4">
                        <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 font-black">
                          {s.nomor}
                        </span>
                        <div className="truncate">
                            <span className="block font-bold text-slate-800 dark:text-white truncate">{s.namaLatin}</span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{s.arti}</span>
                        </div>
                      </div>
                      <span className="font-arabic text-2xl text-emerald-600 dark:text-emerald-500">{s.nama}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- SECTION AYAT FAVORIT --- */}
        <section className="pb-20">
          <div className="flex items-center gap-4 mb-8">
            <span className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">Potongan Ayat</span>
            <div className="h-[1px] flex-grow bg-slate-200 dark:bg-slate-800"></div>
          </div>

          {bookmarks.ayat.length === 0 ? (
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-12 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-400 font-medium italic">Belum ada ayat favorit yang disimpan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {bookmarks.ayat.map((a, index) => (
                <div key={index} className="relative group">
                  {/* Tombol Un-Bookmark Cepat */}
                  <button 
                    onClick={() => dispatch(toggleBookmarkAyat(a))}
                    className="absolute top-6 right-6 z-20 bg-white dark:bg-slate-700 shadow-lg p-2 rounded-xl text-yellow-400 hover:text-red-500 transition-all border border-slate-100 dark:border-slate-600 hover:scale-110"
                  >
                    <StarIcon className="w-5 h-5" />
                  </button>

                  <Link to={`/surat/${a.nomorSurah}`}>
                    <div className="p-8 md:p-10 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-100 dark:hover:shadow-none transition-all relative overflow-hidden">
                      
                      {/* Badge Info */}
                      <div className="flex items-center gap-2 mb-8">
                        <div className="h-8 w-1 bg-emerald-500 rounded-full"></div>
                        <div className="px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-black tracking-tight border border-emerald-100 dark:border-emerald-800/50">
                          QS. {a.surah} : {a.nomorAyat}
                        </div>
                      </div>
                      
                      {/* Teks Arab (Rata Kanan & Berjarak) */}
                      <div className="pr-12 md:pr-16 mb-8">
                        <p className="text-right font-arabic text-3xl md:text-4xl text-slate-800 dark:text-emerald-50 leading-[4rem] md:leading-[5rem]" dir="rtl">
                          {a.teksArab}
                        </p>
                      </div>
                      
                      {/* Latin & Terjemahan */}
                      <div className="pt-6 border-t border-slate-50 dark:border-slate-700/50 space-y-2">
                        <p className="text-emerald-600 dark:text-emerald-400 text-sm italic font-medium">
                          {a.teksLatin}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                          "{a.teksIndonesia}"
                        </p>
                      </div>

                      {/* Ornamen Transparan */}
                      <div className="absolute -bottom-6 -left-6 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                        <StarIcon className="w-40 h-40 text-slate-900 dark:text-white" />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Favorites;