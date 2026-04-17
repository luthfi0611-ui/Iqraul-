// Skeleton adalah placeholder yang tampil saat loading
// Memberikan pengalaman pengguna yang lebih baik

// Skeleton untuk card surat di halaman Home
export const SkeletonCard = () => (
  <div className="animate-pulse bg-gray-200 h-32 rounded-xl"></div>
  // animate-pulse: efek kedip-kedip Tailwind
  // bg-gray-200: warna abu-abu
  // h-32: tinggi tetap
  // rounded-xl: sudut membulat
);

// Skeleton untuk detail ayat di halaman Detail
export const SkeletonAyat = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/4 ml-auto"></div>
    <div className="h-4 bg-gray-200 rounded w-full"></div>
  </div>
  // space-y-4: jarak antar elemen vertikal
  // ml-auto: margin left auto (untuk posisi kanan)
);
