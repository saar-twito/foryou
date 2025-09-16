import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './NavigationBar.module.scss';

interface HeaderProps {
  onLoginClick: () => void;
  onLogoutClick: () => Promise<void>;
}

const NavigationBar: React.FC<HeaderProps> = ({ onLoginClick, onLogoutClick }) => {
  const { user } = useAuth();

  return (
    <header className={styles.navigation}>
      <div className={styles.brand}>
        <Link to="/" className={styles.brandLink}>
          Product Store
        </Link>
      </div>

      <nav className={styles.nav}>
        <Link to="/" className={styles.link}>Catalog</Link>
        {user && user.role === 'admin' && (
          <Link to="/admin" className={styles.link}>Admin Dashboard</Link>
        )}

        {user ? (
          <div className={styles.userInfo}>
            <span className={styles.userName}>Hello, {user.name}</span>
            <button className={styles.button} onClick={onLogoutClick}>Logout</button>
          </div>
        ) : (
          <button className={styles.button} onClick={onLoginClick}>Login</button>
        )}
      </nav>
    </header>
  );
};

export default NavigationBar;
