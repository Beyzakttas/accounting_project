import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import AuthLayout from '../components/common/AuthLayout';
import LoadingButton from '../components/common/LoadingButton';
import { useToast } from '../contexts/ToastContext';
import { registerUser } from '../services/authService';
import FormInput from '../components/common/FormInput';
import '../assets/css/Register.css';

function Register() {
    const { addToast } = useToast();
    const navigate = useNavigate();

    const validationSchema = Yup.object().shape({
        fullname: Yup.string()
            .required("Ad Soyad zorunludur."),
        email: Yup.string()
            .email("Lütfen geçerli bir e-posta adresi giriniz.")
            .required("E-posta alanı zorunludur."),
        password: Yup.string()
            .min(6, "Şifre en az 6 karakter olmalıdır.")
            .required("Şifre alanı zorunludur."),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], "Şifreler birbiriyle eşleşmiyor.")
            .required("Şifre tekrarı zorunludur.")
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const response = await registerUser(values);
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
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            containerClass="register-glass-card"
            wrapperClass="register-wrapper"
        >
            <div className="register-form-container">
                <div className="register-header">
                    <h1 className="register-title">Kayıt Ol</h1>
                    <p className="register-subtitle">Bilgilerinizi girerek hesabınızı oluşturun</p>
                </div>

                <Formik
                    initialValues={{
                        fullname: '',
                        email: '',
                        password: '',
                        confirmPassword: ''
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form className="register-form">
                            <div className="form-grid">
                                <FormInput
                                    name="fullname"
                                    label="Ad Soyad"
                                    type="text"
                                    placeholder="Ahmet Yılmaz"
                                />

                                <FormInput
                                    name="email"
                                    label="E-posta"
                                    type="email"
                                    placeholder="ornek@sirket.com"
                                />

                                <FormInput
                                    name="password"
                                    label="Şifre"
                                    type="password"
                                    placeholder="••••••••"
                                />

                                <FormInput
                                    name="confirmPassword"
                                    label="Şifre (Tekrar)"
                                    type="password"
                                    placeholder="••••••••"
                                />
                            </div>

                            <LoadingButton isLoading={isSubmitting} className="register-btn">
                                Hesabımı Oluştur
                            </LoadingButton>
                        </Form>
                    )}
                </Formik>

                <div className="register-footer">
                    <p>Zaten hesabınız var mı? <Link to="/">Giriş Yap</Link></p>
                </div>
            </div>

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
