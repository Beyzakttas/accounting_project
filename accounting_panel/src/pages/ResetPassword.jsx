import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import './Login.css';

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { addToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Şifreler eşleşmiyor.");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                addToast("Şifreniz başarıyla güncellendi!", "success");
                navigate('/');
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError("Sunucuya bağlanılamadı.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </div>

            <div className="login-glass-card">
                <div className="login-header">
                    <h1 className="login-title">Yeni Şifre Belirle</h1>
                    <p className="login-subtitle">Lütfen yeni şifrenizi girin.</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label>Yeni Şifre</label>
                        <div className="input-wrapper">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Şifreyi Onayla</label>
                        <div className="input-wrapper">
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? <span className="loader"></span> : 'Şifreyi Güncelle'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
