import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Header } from '../components/layout/Header';
import styles from './auth.module.css';

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const res = (error as { response?: { data?: { message?: string } } }).response;
    if (res?.data?.message) return res.data.message;
  }
  return '회원가입에 실패했습니다. 다시 시도해 주세요.';
}

function validateEmail(email: string): string {
  if (!email) return '이메일을 입력해 주세요';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '올바른 이메일 형식이 아닙니다';
  return '';
}

function validatePassword(password: string): string {
  if (!password) return '비밀번호를 입력해 주세요';
  if (password.length < 8) return '8자 이상 입력해 주세요';
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password))
    return '영문·숫자·특수문자를 각 1자 이상 포함해야 합니다';
  return '';
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { mutate: register, isPending, isError, error } = useRegister();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, password: false });

  const nameError = touched.name && !name ? '이름을 입력해 주세요' : '';
  const emailError = touched.email ? validateEmail(email) : '';
  const passwordError = touched.password ? validatePassword(password) : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    if (!name || eErr || pErr) return;
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
          <h1 className={styles.title}>회원가입</h1>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input
              label="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="이름을 입력하세요"
              errorMessage={nameError}
              required
            />
            <Input
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="이메일을 입력하세요"
              errorMessage={emailError}
              required
            />
            <Input
              label="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="8~128자, 영문·숫자·특수문자 각 1자 이상"
              errorMessage={passwordError}
              required
            />
            {isError && (
              <div className={styles.errorBox} role="alert">
                {getErrorMessage(error)}
              </div>
            )}
            <Button type="submit" className={styles.submitBtn} loading={isPending}>
              회원가입
            </Button>
          </form>
          <p className={styles.footer}>
            이미 계정이 있으신가요?
            <Link to="/login" className={styles.footerLink}>
              로그인
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
