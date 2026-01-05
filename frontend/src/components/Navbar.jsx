import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>
          🏪 LocalMarket
        </Link>

        <div className={styles.navLinks}>
          {user?.role !== 'vendor' && (
            <>
              <Link to="/" className={styles.navLink}>
                Products
              </Link>
              <Link to="/vendors" className={styles.navLink}>
                Vendors
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <>
              {user?.role === 'customer' && (
                <>
                  <Link to="/cart" className={styles.navLink}>
                    🛒 Cart
                  </Link>
                  <Link to="/orders" className={styles.navLink}>
                    Orders
                  </Link>
                </>
              )}

              {user?.role === 'vendor' && (
                <Link to="/vendor/dashboard" className={styles.navLink}>
                  Dashboard
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" className={styles.navLink}>
                  Admin
                </Link>
              )}

              <div className={styles.userMenu}>
                <span className={styles.userName}>👤 {user?.name}</span>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navLink}>
                Login
              </Link>
              <Link to="/register" className={styles.signupBtn}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
