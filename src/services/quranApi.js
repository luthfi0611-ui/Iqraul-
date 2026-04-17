import axios from 'axios';

// BASE_URL adalah alamat API yang akan kita gunakan
const BASE_URL = 'https://equran.id/api/v2';

// Fungsi untuk mengambil semua surat
// Kembalikan Promise yang berisi data dari API
export const fetchAllSurah = () => axios.get(`${BASE_URL}/surat`);

// Fungsi untuk mengambil detail surat berdasarkan nomor
// Parameter 'nomor' akan diganti dengan nomor surat yang diinginkan
export const fetchDetailSurah = (nomor) => axios.get(`${BASE_URL}/surat/${nomor}`);