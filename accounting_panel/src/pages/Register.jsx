import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

function Register() {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        role: 'USER'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordError, setShowPasswordError] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validatePassword = (pass) => {
        // En az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter.
        // Daha geniş bir özel karakter kümesi destekleniyor.
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
        return regex.test(pass);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validatePassword(formData.password)) {
            setShowPasswordError(true);
            return;
        }

        setShowPasswordError(false);

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Kayıt başarılı! Giriş yapabilirsiniz.");
                navigate('/');
            } else {
                alert("Hata: " + (data.message || "Kayıt işlemi başarısız."));
            }
        } catch (error) {
            console.error("Bağlantı hatası:", error);
            alert("Sunucuya bağlanılamadı. Lütfen backend'in çalıştığından emin olun.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-wrapper">
            <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? '☀️' : '🌙'}
            </button>

            <div className="blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </div>

            <div className="register-glass-card">
                <div className="register-form-container">
                    <div className="register-header">
                        <h1 className="register-title">Kayıt Ol</h1>
                        <p className="register-subtitle">Bilgilerinizi girerek hesabınızı oluşturun</p>
                    </div>

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Ad Soyad</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        name="fullname"
                                        value={formData.fullname}
                                        onChange={handleChange}
                                        placeholder="Ad Soyad"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>E-posta</label>
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="ornek@sirket.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Şifre</label>
                                <div className="input-wrapper">
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Rol</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="ADMIN">Admin</option>
                                    <option value="MANAGER">Yönetici</option>
                                    <option value="USER">Kullanıcı</option>
                                </select>
                            </div>
                        </div>

                        {showPasswordError && (
                            <div className="password-instruction error">
                                <small className="password-hint">
                                    ❌ Şifre: Min. 8 karakter, büyük/küçük harf, rakam ve özel karakter içermelidir.
                                </small>
                            </div>
                        )}

                        <button type="submit" className="register-btn" disabled={isLoading}>
                            {isLoading ? <span className="loader"></span> : 'Hesabımı Oluştur'}
                        </button>
                    </form>

                    <div className="register-footer">
                        <p>Zaten hesabınız var mı? <Link to="/">Giriş Yap</Link></p>
                    </div>
                </div>

                <div className="register-side-info">
                    <div className="side-content">
                        <div className="logo-icon">🚀</div>
                        <h2 className="side-title">Muhasebe AI</h2>
                        <p className="side-text">Modern, hızlı ve yapay zeka destekli muhasebe yönetimine bugün başlayın.</p>
                        <ul className="side-features">
                            <li>✨ Akıllı Fatura Takibi</li>
                            <li>📊 Gelişmiş Raporlama</li>
                            <li>🛡️ Güvenli Bulut Altyapısı</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
