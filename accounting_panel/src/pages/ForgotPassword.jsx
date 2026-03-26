import React, { useState } from 'react';
import AuthLayout from '../components/common/AuthLayout';
import LoadingButton from '../components/common/LoadingButton';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import '../assets/css/Login.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            const data = await forgotPassword(email);
            setMessage(data.message);
        } catch (err) {
            setError(err.message || "Sunucuya bağlanılamadı.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Şifremi Unuttum" subtitle="E-posta adresinizi girin, size bir sıfırlama bağlantısı gönderelim.">
            <form onSubmit={handleSubmit} className="login-form">
                <div className="input-group">
                    <label>E-posta</label>
                    <div className="input-wrapper">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@sirket.com"
                            required
                        />
                    </div>
                </div>

                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}

                <LoadingButton isLoading={isLoading}>Bağlantı Gönder</LoadingButton>
            </form>

            <div className="login-footer">
                <p><Link to="/" className="primary-link">Girişe Dön</Link></p>
            </div>
        </AuthLayout>
    );
}

export default ForgotPassword;
