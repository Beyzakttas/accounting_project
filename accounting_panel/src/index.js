import React from 'react';
import ReactDOM from 'react-dom/client'; // Burası artık 'react-dom/client' olmalı
import './index.css';
import App from './App';

// Yeni nesil root oluşturma yöntemi
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);