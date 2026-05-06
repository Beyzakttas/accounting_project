import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import AuthLayout from '../components/common/AuthLayout';
import LoadingButton from '../components/common/LoadingButton';
import { useToast } from '../contexts/ToastContext';
import { resetPassword } from '../services/authService';
import FormInput from '../components/common/FormInput';
import '../assets/css/Login.css';

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const validationSchema = Yup.object().shape({
        password: Yup.string()
            .min(6, "Şifre en az 6 karakter olmalıdır.")
            .required("Şifre alanı zorunludur."),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], "Şifreler eşleşmiyor.")
            .required("Şifre tekrarı zorunludur.")
    });

    const handleSubmit = async (values, { setSubmitting, setStatus }) => {
        try {
            await resetPassword(token, values.password);
            addToast("Şifreniz başarıyla güncellendi!", "success");
            navigate('/');
        } catch (err) {
            setStatus({ error: err.message || "Sunucuya bağlanılamadı." });
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
                Güvenli erişim<br />
                <span>her zaman</span> önceliğimiz
            </h1>

            <p className="left-subtitle" style={{ marginBottom: '8rem' }}>
                Hesabınızı doğrulanmış e-posta adresiniz üzerinden kurtarabilirsiniz.
            </p>

            <div className="left-stats-row">
                <div className="stat-item">
                    <h3>12.400+</h3>
                    <p>AKTİF<br />FİRMA</p>
                </div>
                <div className="stat-item">
                    <h3>99.8%</h3>
                    <p>KESİNTİ<br />YOK</p>
                </div>
                <div className="stat-item">
                    <h3 style={{ color: '#10b981' }}>ISO</h3>
                    <p>27001</p>
                </div>
            </div>
        </>
    );

    return (
        <AuthLayout leftPanelContent={leftPanelContent}>
            <div className="login-header">
                <h1 className="login-title">Yeni Şifre Belirle</h1>
                <p className="login-subtitle">Lütfen yeni şifrenizi girin.</p>
            </div>

            <Formik
                initialValues={{ password: '', confirmPassword: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, status }) => (
                    <Form className="login-form">
                        <FormInput
                            name="password"
                            label="YENİ ŞİFRE"
                            type="password"
                            placeholder="••••••••"
                        />

                        <FormInput
                            name="confirmPassword"
                            label="ŞİFREYİ ONAYLA"
                            type="password"
                            placeholder="••••••••"
                        />

                        {status?.error && <p className="error-message">{status.error}</p>}

                        <LoadingButton isLoading={isSubmitting}>Şifreyi Güncelle</LoadingButton>
                    </Form>
                )}
            </Formik>
        </AuthLayout>
    );
}

export default ResetPassword;
