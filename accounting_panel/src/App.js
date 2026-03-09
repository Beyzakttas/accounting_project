import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// ... importlar aynı kalıyor

function App() {
  const [username, setUsername] = useState(localStorage.getItem('userName') || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(localStorage.getItem('role') || 'Admin');

  const handleLogin = (e) => {
    // e.preventDefault() eklemeyi unutma, sayfa yenilenmesin
    if (e) e.preventDefault();
    console.log(`Giriş Denemesi -> Kullanıcı: ${username}, Şifre: ${password}, Rol: ${role}`);
    // Buraya backend istek kodunu yazacağız
  };

  const user = {
    name: username || 'Kullanıcı',
    role: role.toLowerCase(),
  };

  return (
    <Router>
      <Routes>
        {/* Login bileşenine tüm yetkileri ve verileri gönderiyoruz */}
        <Route path="/" element={
          <Login
            setUsername={setUsername}
            setPassword={setPassword}
            setRole={setRole}
            handleLogin={handleLogin}
            values={{ username, password, role }}
          />
        } />
        <Route path="/dashboard" element={<Dashboard user={user} onLogout={() => console.log('Çıkış yapıldı')} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
