import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUpdateMe } from '../hooks/useAuth';
import { Header } from '../components/layout/Header';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [nameSuccess, setNameSuccess] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const { mutate: updateName, isPending: isNamePending } = useUpdateMe();
  const { mutate: updatePassword, isPending: isPasswordPending } = useUpdateMe();

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
          setNameSuccess('이름이 저장되었습니다.');
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
      setConfirmError('새 비밀번호가 일치하지 않습니다');
      return;
    }

    updatePassword(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordSuccess('비밀번호가 변경되었습니다.');
          setTimeout(() => setPasswordSuccess(''), 3000);
        },
        onError: (error: unknown) => {
          const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
          if (msg?.includes('현재 비밀번호')) {
            setPasswordError('현재 비밀번호가 올바르지 않습니다');
          } else {
            setPasswordError('비밀번호 변경에 실패했습니다');
          }
        },
      }
    );
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.heading}>내 정보 수정</h1>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>이름 변경</h2>
            <form onSubmit={handleNameSave} noValidate>
              <Input
                label="이름"
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
                  이름 저장
                </Button>
              </div>
            </form>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>비밀번호 변경</h2>
            <form onSubmit={handlePasswordChange} noValidate>
              <Input
                label="현재 비밀번호"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                errorMessage={passwordError}
                required
              />
              <Input
                label="새 비밀번호"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                maxLength={128}
                required
              />
              <Input
                label="새 비밀번호 확인"
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
                  비밀번호 변경
                </Button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
