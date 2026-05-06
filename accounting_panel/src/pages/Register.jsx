import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import AuthLayout from '../components/common/AuthLayout';
import LoadingButton from '../components/common/LoadingButton';
import { useToast } from '../contexts/ToastContext';
import { registerUser } from '../services/authService';
import FormInput from '../components/common/FormInput';
import '../assets/css/Login.css'; // Re-use the unified form styles

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

    const leftPanelContent = (
        <>
            <div className="left-brand-header">
                Finans Pro
            </div>

            <h1 className="left-main-title">
                İşinizi büyütmeye<br />
                <span>bugün</span> başlayın
            </h1>

            <p className="left-subtitle">
                Yapay zeka destekli ön-muhasebe sistemine hemen katılın, finansal süreçlerinizi tek tıkla otomatikleştirin.
            </p>

            <ul className="left-feature-list">
                <li className="left-feature-item">
                    <div className="feature-icon-box">🚀</div>
                    Ücretsiz ve anında kurulum
                </li>
                <li className="left-feature-item">
                    <div className="feature-icon-box">🤖</div>
                    Sınırsız yapay zeka asistanı
                </li>
                <li className="left-feature-item">
                    <div className="feature-icon-box">📱</div>
                    Tüm cihazlardan anlık erişim
                </li>
            </ul>
        </>
    );

    return (
        <AuthLayout leftPanelContent={leftPanelContent}>
            <div className="login-header">
                <h1 className="login-title">Kayıt Ol</h1>
                <p className="login-subtitle">Bilgilerinizi girerek hesabınızı oluşturun.</p>
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
                    <Form className="login-form" style={{ gap: '0.75rem' }}>
                        <FormInput
                            name="fullname"
                            label="AD SOYAD"
                            type="text"
                            placeholder="Ahmet Yılmaz"
                        />

                        <FormInput
                            name="email"
                            label="E-POSTA"
                            type="email"
                            placeholder="ornek@firma.com"
                        />

                        <FormInput
                            name="password"
                            label="ŞİFRE"
                            type="password"
                            placeholder="••••••••"
                        />

                        <FormInput
                            name="confirmPassword"
                            label="ŞİFRE (TEKRAR)"
                            type="password"
                            placeholder="••••••••"
                        />

                        <LoadingButton isLoading={isSubmitting} className="login-btn" style={{ marginTop: '0.5rem' }}>
                            Hesabımı Oluştur
                        </LoadingButton>
                    </Form>
                )}
            </Formik>

            <div className="login-footer">
                <p>Zaten hesabınız var mı? <Link to="/" className="auth-border-btn">Giriş yapın</Link></p>
            </div>
        </AuthLayout>
    );
}

export default Register;
