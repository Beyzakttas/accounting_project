import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StaffManagement from './pages/StaffManagement';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

// ... importlar aynı kalıyor

function App() {
  const [user, setUser] = useState({
    name: localStorage.getItem('userName') || '',
    role: localStorage.getItem('role') || 'USER', // Default to USER if not set
  });

  const handleLogout = () => {
    localStorage.clear();
    setUser({ name: '', role: 'USER' });
    window.location.href = '/';
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <Login setUser={setUser} />
            } />
            <Route path="/dashboard" element={<Dashboard user={user} onLogout={handleLogout} />} />
            <Route path="/staff" element={<StaffManagement user={user} onLogout={handleLogout} />} />
            <Route path="/invoices" element={<Invoices user={user} onLogout={handleLogout} />} />
            <Route path="/reports" element={<Reports user={user} onLogout={handleLogout} />} />
            <Route path="/settings" element={<Settings user={user} onLogout={handleLogout} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
