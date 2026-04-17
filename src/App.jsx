import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Favorites from './pages/Favorites';
function App() {
  return (
    // BrowserRouter: Membungkus seluruh aplikasi untuk routing
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Routes: Container untuk semua Route */}
        <Routes>
          {/* Route: Menghubungkan URL dengan komponen */}
          <Route path="/" element={<Home />} />
          <Route path="/surat/:nomor" element={<Detail />} />
          {/* :nomor adalah parameter dinamis */}
<Route path="/" element={<Home />} />
<Route path="/surat/:nomor" element={<Detail />} />
<Route path="/favorites" element={<Favorites />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
