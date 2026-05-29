import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../hooks/useAuth';
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

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: login, isPending, isError, error } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    login(
      { email, password },
      { onSuccess: () => navigate('/todos') }
    );
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>{t('auth.login_title')}</h1>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.email_placeholder')}
              required
            />
            <Input
              label={t('auth.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.password_placeholder')}
              required
            />
            {isError && (
              <div className={styles.errorBox} role="alert">
                {getErrorMessage(error, t('auth.login_error'))}
              </div>
            )}
            <Button type="submit" className={styles.submitBtn} loading={isPending}>
              {t('auth.login_btn')}
            </Button>
          </form>
          <p className={styles.footer}>
            {t('auth.no_account')}
            <Link to="/register" className={styles.footerLink}>
              {t('auth.register_link')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
