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

    return (
        <AuthLayout title="Yeni Şifre Belirle" subtitle="Lütfen yeni şifrenizi girin.">
            <Formik
                initialValues={{ password: '', confirmPassword: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, status }) => (
                    <Form className="login-form">
                        <FormInput
                            name="password"
                            label="Yeni Şifre"
                            type="password"
                            placeholder="••••••••"
                        />

                        <FormInput
                            name="confirmPassword"
                            label="Şifreyi Onayla"
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
