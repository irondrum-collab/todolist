import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegister } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Header } from '../components/layout/Header';
import styles from './auth.module.css';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const res = (error as { response?: { data?: { message?: string } } }).response;
    if (res?.data?.message) return res.data.message;
  }
  return fallback;
}

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: register, isPending, isError, error } = useRegister();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, password: false });

  const validateEmail = (v: string) => {
    if (!v) return t('auth.email_required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return t('auth.email_invalid');
    return '';
  };

  const validatePassword = (v: string) => {
    if (!v) return t('auth.password_required');
    if (v.length < 8) return t('auth.password_min_length');
    if (!/[a-zA-Z]/.test(v) || !/[0-9]/.test(v) || !/[^a-zA-Z0-9]/.test(v))
      return t('auth.password_strength');
    return '';
  };

  const nameError = touched.name && !name ? t('auth.name_required') : '';
  const emailError = touched.email ? validateEmail(email) : '';
  const passwordError = touched.password ? validatePassword(password) : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!name || validateEmail(email) || validatePassword(password)) return;
    register(
      { name, email, password },
      { onSuccess: () => navigate('/login') }
    );
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>{t('auth.register_title')}</h1>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input
              label={t('auth.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, name: true }))}
              placeholder={t('auth.name_placeholder')}
              errorMessage={nameError}
              required
            />
            <Input
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              placeholder={t('auth.email_placeholder')}
              errorMessage={emailError}
              required
            />
            <Input
              label={t('auth.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, password: true }))}
              placeholder={t('auth.password_hint')}
              errorMessage={passwordError}
              required
            />
            {isError && (
              <div className={styles.errorBox} role="alert">
                {getErrorMessage(error, t('auth.register_error'))}
              </div>
            )}
            <Button type="submit" className={styles.submitBtn} loading={isPending}>
              {t('auth.register_btn')}
            </Button>
          </form>
          <p className={styles.footer}>
            {t('auth.has_account')}
            <Link to="/login" className={styles.footerLink}>
              {t('auth.login_link')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
