import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Login.css'; // Reusing Login styles for consistency

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
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
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
                    <h1 className="login-title">Şifremi Unuttum</h1>
                    <p className="login-subtitle">E-posta adresinizi girin, size bir sıfırlama bağlantısı gönderelim.</p>
                </div>

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

                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? <span className="loader"></span> : 'Bağlantı Gönder'}
                    </button>
                </form>

                <div className="login-footer">
                    <p><Link to="/" className="primary-link">Girişe Dön</Link></p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
