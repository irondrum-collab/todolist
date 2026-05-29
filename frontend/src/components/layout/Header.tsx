import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useUpdateMe } from '../../hooks/useAuth';
import styles from './Header.module.css';

export function Header() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const theme = useAuthStore((s) => s.theme);
  const setTheme = useAuthStore((s) => s.setTheme);
  const language = useAuthStore((s) => s.language);
  const setLanguage = useAuthStore((s) => s.setLanguage);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const { mutate: saveTheme } = useUpdateMe();
  const { mutate: saveLanguage } = useUpdateMe();
  const [themeError, setThemeError] = useState<string | null>(null);
  const [languageError, setLanguageError] = useState<string | null>(null);

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (token) {
      saveTheme({ theme: newTheme }, {
        onError: () => {
          setThemeError(t('header.theme_error'));
          setTimeout(() => setThemeError(null), 3000);
        },
      });
    }
  };

  const handleLanguageSelect = (lang: 'ko' | 'en') => {
    if (lang === language) return;
    setLanguage(lang);
    if (token) {
      saveLanguage({ language: lang }, {
        onError: () => {
          setLanguageError(t('header.lang_error'));
          setTimeout(() => setLanguageError(null), 3000);
        },
      });
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const langButtons = (
    <div className={styles.langGroup}>
      <button
        className={`${styles.langBtn} ${language === 'ko' ? styles.langBtnActive : ''}`}
        onClick={() => handleLanguageSelect('ko')}
        aria-pressed={language === 'ko'}
        aria-label={t('header.lang_ko_label')}
      >
        KO
      </button>
      <button
        className={`${styles.langBtn} ${language === 'en' ? styles.langBtnActive : ''}`}
        onClick={() => handleLanguageSelect('en')}
        aria-pressed={language === 'en'}
        aria-label={t('header.lang_en_label')}
      >
        EN
      </button>
    </div>
  );

  return (
    <header className={styles.header}>
      <Link to={user ? '/todos' : '/login'} className={styles.logo}>
        {t('header.logo')}
      </Link>
      <nav className={styles.nav}>
        {user ? (
          <>
            <span className={styles.userName}>{t('header.user_greeting', { name: user.name })}</span>
            <Link to="/profile" className={styles.navLink}>
              {t('common.my_info')}
            </Link>
            <button
              className={styles.themeBtn}
              onClick={handleThemeToggle}
              aria-label={theme === 'light' ? t('header.theme_to_dark') : t('header.theme_to_light')}
            >
              {theme === 'light' ? t('header.theme_dark_btn') : t('header.theme_light_btn')}
            </button>
            {langButtons}
            <button className={styles.logoutBtn} onClick={handleLogout}>
              {t('common.logout')}
            </button>
          </>
        ) : (
          <>
            <button
              className={styles.themeBtn}
              onClick={handleThemeToggle}
              aria-label={theme === 'light' ? t('header.theme_to_dark') : t('header.theme_to_light')}
            >
              {theme === 'light' ? t('header.theme_dark_btn') : t('header.theme_light_btn')}
            </button>
            {langButtons}
            <Link to="/login" className={styles.navLink}>
              {t('header.login')}
            </Link>
            <Link to="/register" className={styles.navLink}>
              {t('header.register')}
            </Link>
          </>
        )}
      </nav>
      {themeError && <div className={styles.toastError} role="alert">{themeError}</div>}
      {languageError && <div className={styles.toastError} role="alert">{languageError}</div>}
    </header>
  );
}
