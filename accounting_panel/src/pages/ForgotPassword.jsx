import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import AuthLayout from '../components/common/AuthLayout';
import LoadingButton from '../components/common/LoadingButton';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import FormInput from '../components/common/FormInput';
import '../assets/css/Login.css';

function ForgotPassword() {
    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email("Lütfen geçerli bir e-posta adresi giriniz.")
            .required("E-posta alanı zorunludur.")
    });

    const handleSubmit = async (values, { setSubmitting, setStatus }) => {
        try {
            const data = await forgotPassword(values.email);
            setStatus({ success: data.message });
        } catch (err) {
            setStatus({ error: err.message || "Sunucuya bağlanılamadı." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout title="Şifremi Unuttum" subtitle="E-posta adresinizi girin, size bir sıfırlama bağlantısı gönderelim.">
            <Formik
                initialValues={{ email: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, status }) => (
                    <Form className="login-form">
                        <FormInput
                            name="email"
                            label="E-posta"
                            type="email"
                            placeholder="ornek@sirket.com"
                        />

                        {status?.success && <p className="success-message">{status.success}</p>}
                        {status?.error && <p className="error-message">{status.error}</p>}

                        <LoadingButton isLoading={isSubmitting}>Bağlantı Gönder</LoadingButton>
                    </Form>
                )}
            </Formik>

            <div className="login-footer">
                <p><Link to="/" className="primary-link">Girişe Dön</Link></p>
            </div>
        </AuthLayout>
    );
}

export default ForgotPassword;
