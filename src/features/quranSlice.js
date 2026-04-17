import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAllSurah, fetchDetailSurah } from '../services/quranApi';

// ============ ASYNC THUNK ============
// Mengambil semua daftar surat dari API
export const getAllSurah = createAsyncThunk(
  'quran/getAllSurah',
  async () => {
    const response = await fetchAllSurah();
    return response.data.data;
  }
);

// Mengambil detail ayat dalam satu surat berdasarkan nomor surat
export const getSurahDetail = createAsyncThunk(
  'quran/getDetail',
  async (nomor) => {
    const response = await fetchDetailSurah(nomor);
    return response.data.data;
  }
);

// ============ INITIAL STATE ============
const initialState = {
  surahList: [],
  detailSurah: null,
  loading: false,
  error: null,
  searchTerm: '',

  // Mengambil data bookmark yang sudah tersimpan di browser (jika ada)
  bookmarks: {
    ayat: JSON.parse(localStorage.getItem('bookmarkAyat')) || [],
    surah: JSON.parse(localStorage.getItem('bookmarkSurah')) || [],
  },
  
  // Fitur tambahan: Terakhir dibaca & Mode Gelap
  lastRead: JSON.parse(localStorage.getItem('lastRead')) || null,
  darkMode: JSON.parse(localStorage.getItem('darkMode')) || false,
};

// ============ SLICE ============
const quranSlice = createSlice({
  name: 'quran',
  initialState,

  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },

    // 🌙 TOGGLE DARK MODE
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', JSON.stringify(state.darkMode));
    },

    // 📖 SET TERAKHIR DIBACA
    setLastRead: (state, action) => {
      state.lastRead = action.payload;
      localStorage.setItem('lastRead', JSON.stringify(action.payload));
    },

    // ⭐ TOGGLE BOOKMARK AYAT (Masuk/Hapus Favorit)
    toggleBookmarkAyat: (state, action) => {
      const ayat = action.payload; // Harus berisi { nomorAyat, surah, teksArab, dll }

      const exist = state.bookmarks.ayat.find(
        (item) =>
          item.nomorAyat === ayat.nomorAyat &&
          item.surah === ayat.surah
      );

      if (exist) {
        // Jika sudah ada, hapus dari favorit
        state.bookmarks.ayat = state.bookmarks.ayat.filter(
          (item) =>
            !(item.nomorAyat === ayat.nomorAyat &&
              item.surah === ayat.surah)
        );
      } else {
        // Jika belum ada, masukkan ke favorit
        state.bookmarks.ayat.push(ayat);
      }

      // Simpan ke localStorage agar permanen
      localStorage.setItem(
        'bookmarkAyat',
        JSON.stringify(state.bookmarks.ayat)
      );
    },

    // ⭐ TOGGLE BOOKMARK SURAH (Masuk/Hapus Favorit)
    toggleBookmarkSurah: (state, action) => {
      const surah = action.payload; // Berisi data object surat

      const exist = state.bookmarks.surah.find(
        (item) => item.nomor === surah.nomor
      );

      if (exist) {
        // Jika sudah ada, hapus
        state.bookmarks.surah = state.bookmarks.surah.filter(
          (item) => item.nomor !== surah.nomor
        );
      } else {
        // Jika belum ada, simpan
        state.bookmarks.surah.push(surah);
      }

      localStorage.setItem(
        'bookmarkSurah',
        JSON.stringify(state.bookmarks.surah)
      );
    },
  },

  extraReducers: (builder) => {
    builder
      // HANDLE GET ALL SURAH
      .addCase(getAllSurah.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllSurah.fulfilled, (state, action) => {
        state.loading = false;
        state.surahList = action.payload;
      })
      .addCase(getAllSurah.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // HANDLE GET DETAIL SURAH
      .addCase(getSurahDetail.pending, (state) => {
        state.loading = true;
        state.detailSurah = null; // Reset detail biar gak nampilin surat sebelumnya
      })
      .addCase(getSurahDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.detailSurah = action.payload;
      })
      .addCase(getSurahDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// ✅ EXPORT ACTIONS
export const {
  setSearchTerm,
  toggleBookmarkAyat,
  toggleBookmarkSurah,
  toggleDarkMode,
  setLastRead
} = quranSlice.actions;

// ✅ EXPORT REDUCER
export default quranSlice.reducer;