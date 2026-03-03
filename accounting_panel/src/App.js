import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

// ... importlar aynı kalıyor

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');

  const handleLogin = (e) => {
    // e.preventDefault() eklemeyi unutma, sayfa yenilenmesin
    if(e) e.preventDefault(); 
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
            values={{username, password, role}}
          />
        } />
        <Route path="/dashboard" element={<Dashboard user={user} onLogout={() => console.log('Çıkış yapıldı')} />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
