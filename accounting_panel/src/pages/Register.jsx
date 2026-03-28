import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/common/AuthLayout';
import LoadingButton from '../components/common/LoadingButton';
import { useToast } from '../contexts/ToastContext';
import { registerUser } from '../services/authService';
import '../assets/css/Register.css';

function Register() {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordError, setShowPasswordError] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validatePassword = (pass) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
        return regex.test(pass);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validatePassword(formData.password)) {
            setShowPasswordError(true);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            addToast("Şifreler birbirleriyle eşleşmiyor!", "error");
            return;
        }

        setShowPasswordError(false);
        setIsLoading(true);

        try {
            const response = await registerUser(formData);
            const { user: userData, token } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('role', userData.role);
            localStorage.setItem('userName', userData.fullname);

            addToast("Kayıt başarılı! Giriş yapıldı.", "success");
            navigate('/dashboard');
        } catch (error) {
            console.error("Bağlantı hatası:", error);
            addToast("Hata: " + (error.message || "Kayıt işlemi başarısız."), "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            containerClass="register-glass-card"
            wrapperClass="register-wrapper"
        >
            {/* Sağ Taraf - Form Bölümü (Şimdi solda olabilir veya tam tersi, DOM sırasına göre) */}
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
                            <label>Şifre (Tekrar)</label>
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {showPasswordError && (
                        <div className="password-instruction error">
                            <small className="password-hint">
                                ❌ Şifre: Min. 8 karakter, büyük/küçük harf, rakam ve özel karakter içermelidir.
                            </small>
                        </div>
                    )}

                    <LoadingButton isLoading={isLoading} className="register-btn">
                        Hesabımı Oluştur
                    </LoadingButton>
                </form>

                <div className="register-footer">
                    <p>Zaten hesabınız var mı? <Link to="/">Giriş Yap</Link></p>
                </div>
            </div>

            {/* Sol Taraf - Bilgi Bölümü (Şimdi sağda olacak) */}
            <div className="register-side-info">
                <div className="logo-icon">🚀</div>
                <h2 className="side-title">Muhasebe AI</h2>
                <p className="side-text">
                    Yapay zeka destekli fatura analizi ve modern muhasebe deneyimine hoş geldiniz.
                </p>
                <ul className="side-features">
                    <li>✅ AI ile Otomatik Fatura Okuma</li>
                    <li>📊 Gelişmiş Raporlama Sistemleri</li>
                    <li>☁️ Güvenli Bulut Altyapısı</li>
                </ul>
            </div>
        </AuthLayout>
    );
}

export default Register;
