import { configureStore } from '@reduxjs/toolkit';
import quranReducer from '../features/quranSlice';

// Store adalah tempat penyimpanan global state
// Semua komponen bisa mengakses state yang ada di store
export const store = configureStore({
  reducer: {
    // Key 'quran' akan menjadi nama slice yang bisa diakses
    // Nilainya adalah reducer yang sudah kita buat
    quran: quranReducer,
  },
});
