import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Header } from '../components/layout/Header';
import styles from './auth.module.css';

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const res = (error as { response?: { data?: { message?: string } } }).response;
    if (res?.data?.message) return res.data.message;
  }
  return '이메일 또는 비밀번호가 올바르지 않습니다';
}

export function LoginPage() {
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
          <h1 className={styles.title}>로그인</h1>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
            />
            <Input
              label="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
            {isError && (
              <div className={styles.errorBox} role="alert">
                {getErrorMessage(error)}
              </div>
            )}
            <Button type="submit" className={styles.submitBtn} loading={isPending}>
              로그인
            </Button>
          </form>
          <p className={styles.footer}>
            계정이 없으신가요?
            <Link to="/register" className={styles.footerLink}>
              회원가입
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
