import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useUpdateMe } from '../hooks/useAuth';
import { Header } from '../components/layout/Header';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const theme = useAuthStore((s) => s.theme);
  const setTheme = useAuthStore((s) => s.setTheme);
  const language = useAuthStore((s) => s.language);
  const setLanguage = useAuthStore((s) => s.setLanguage);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [nameSuccess, setNameSuccess] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  const { mutate: updateName, isPending: isNamePending } = useUpdateMe();
  const { mutate: updatePassword, isPending: isPasswordPending } = useUpdateMe();
  const { mutate: updateSettings, isPending: isSettingsPending } = useUpdateMe();

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  if (!token) return null;

  const handleNameSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateName(
      { name: name.trim() },
      {
        onSuccess: () => {
          setNameSuccess(t('profile.name_saved'));
          setTimeout(() => setNameSuccess(''), 3000);
        },
      }
    );
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setConfirmError('');

    if (newPassword !== confirmPassword) {
      setConfirmError(t('profile.password_mismatch'));
      return;
    }

    updatePassword(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordSuccess(t('profile.password_changed'));
          setTimeout(() => setPasswordSuccess(''), 3000);
        },
        onError: (error: unknown) => {
          const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
          if (msg?.includes('현재 비밀번호')) {
            setPasswordError(t('profile.current_password_wrong'));
          } else {
            setPasswordError(t('profile.password_change_failed'));
          }
        },
      }
    );
  };

  const handleDisplaySave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(
      { theme, language },
      {
        onSuccess: () => {
          setSettingsSuccess(t('profile.settings_saved'));
          setTimeout(() => setSettingsSuccess(''), 3000);
        },
        onError: () => {
          setSettingsError(t('profile.settings_save_failed'));
          setTimeout(() => setSettingsError(''), 3000);
        },
      }
    );
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.heading}>{t('profile.title')}</h1>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('profile.name_section')}</h2>
            <form onSubmit={handleNameSave} noValidate>
              <Input
                label={t('profile.name_label')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                required
              />
              {nameSuccess && (
                <p className={styles.success} role="status">{nameSuccess}</p>
              )}
              <div className={styles.actions}>
                <Button type="submit" loading={isNamePending} disabled={!name.trim()}>
                  {t('profile.save_name')}
                </Button>
              </div>
            </form>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('profile.password_section')}</h2>
            <form onSubmit={handlePasswordChange} noValidate>
              <Input
                label={t('profile.current_password')}
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                errorMessage={passwordError}
                required
              />
              <Input
                label={t('profile.new_password')}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                maxLength={128}
                required
              />
              <Input
                label={t('profile.confirm_password')}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                errorMessage={confirmError}
                required
              />
              {passwordSuccess && (
                <p className={styles.success} role="status">{passwordSuccess}</p>
              )}
              <div className={styles.actions}>
                <Button type="submit" loading={isPasswordPending}>
                  {t('profile.change_password_btn')}
                </Button>
              </div>
            </form>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('profile.display_section')}</h2>
            <form onSubmit={handleDisplaySave} noValidate>
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>{t('profile.theme_label')}</legend>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === 'light'}
                    onChange={() => setTheme('light')}
                  />
                  {t('profile.theme_light')}
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === 'dark'}
                    onChange={() => setTheme('dark')}
                  />
                  {t('profile.theme_dark')}
                </label>
              </fieldset>
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>{t('profile.language_label')}</legend>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="language"
                    value="ko"
                    checked={language === 'ko'}
                    onChange={() => setLanguage('ko')}
                  />
                  {t('profile.language_ko')}
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="language"
                    value="en"
                    checked={language === 'en'}
                    onChange={() => setLanguage('en')}
                  />
                  {t('profile.language_en')}
                </label>
              </fieldset>
              {settingsSuccess && (
                <p className={styles.success} role="status">{settingsSuccess}</p>
              )}
              {settingsError && (
                <p className={styles.error} role="alert">{settingsError}</p>
              )}
              <div className={styles.actions}>
                <Button type="submit" loading={isSettingsPending}>
                  {t('profile.save_settings')}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
