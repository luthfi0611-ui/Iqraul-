import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';  // Import Tailwind CSS
import { Provider } from 'react-redux';
import { store } from './app/store';

// ReactDOM.createRoot: Cara baru React 18 untuk render
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Provider: Membungkus app agar bisa akses Redux store */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
