import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/common/AuthLayout';
import LoadingButton from '../components/common/LoadingButton';
import { useToast } from '../contexts/ToastContext';
import { resetPassword } from '../services/authService';
import '../assets/css/Login.css';

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
            await resetPassword(token, password);
            addToast("Şifreniz başarıyla güncellendi!", "success");
            navigate('/');
        } catch (err) {
            setError(err.message || "Sunucuya bağlanılamadı.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Yeni Şifre Belirle" subtitle="Lütfen yeni şifrenizi girin.">
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

                {error && <p className="error-message">{error}</p>}

                <LoadingButton isLoading={isLoading}>Şifreyi Güncelle</LoadingButton>
            </form>
        </AuthLayout>
    );
}

export default ResetPassword;
