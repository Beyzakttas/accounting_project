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

function Register({ setUser }) {
    const { addToast } = useToast();
    const navigate = useNavigate();

    const validationSchema = Yup.object().shape({
        fullname: Yup.string()
            .required("Ad Soyad zorunludur."),
        email: Yup.string()
            .email("Geçerli bir e-posta adresi giriniz.")
            .required("E-posta alanı zorunludur."),
        password: Yup.string()
            .min(8, "Şifre en az 8 karakter olmalıdır.")
            .matches(/[A-Z]/, "Şifre en az bir büyük harf içermelidir.")
            .matches(/[a-z]/, "Şifre en az bir küçük harf içermelidir.")
            .matches(/[0-9]/, "Şifre en az bir rakam içermelidir.")
            .matches(/[^A-Za-z0-9]/, "Şifre en az bir özel karakter içermelidir.")
            .required("Şifre alanı zorunludur."),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], "Şifreler birbiriyle eşleşmiyor.")
            .required("Şifre tekrarı zorunludur.")
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            // confirmPassword sadece frontend doğrulaması için — API'ye gönderilmez
            const { confirmPassword, ...apiData } = values;
            const response = await registerUser(apiData);
            const { user: userData, token } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('role', userData.role);
            localStorage.setItem('userName', userData.fullname);

            if (setUser) {
                setUser({
                    name: userData.fullname,
                    role: userData.role
                });
            }

            addToast("Kayıt başarılı! Giriş yapıldı.", "success");
            navigate('/dashboard');
        } catch (error) {
            console.error("Kayıt hatası:", error);
            addToast(error.message || "Kayıt işlemi başarısız.", "error");
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
