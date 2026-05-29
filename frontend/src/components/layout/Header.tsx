import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import styles from './Header.module.css';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <Link to={user ? '/todos' : '/login'} className={styles.logo}>
        TodoList
      </Link>
      <nav className={styles.nav}>
        {user ? (
          <>
            <span className={styles.userName}>{user.name} 님</span>
            <Link to="/profile" className={styles.navLink}>
              내 정보
            </Link>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.navLink}>
              로그인
            </Link>
            <Link to="/register" className={styles.navLink}>
              회원가입
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
