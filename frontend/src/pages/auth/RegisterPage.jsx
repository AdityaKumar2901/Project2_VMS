import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AuthPages.module.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password validation checks
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[@$!%*?&]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Create Account</h1>
        <p className={styles.subtitle}>Join our marketplace</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              required
              minLength={8}
            />
            {(passwordFocused || formData.password) && (
              <div className={styles.passwordRequirements}>
                <p className={styles.requirementsTitle}>Password must have:</p>
                <ul>
                  <li className={passwordChecks.length ? styles.valid : styles.invalid}>
                    {passwordChecks.length ? '✓' : '✗'} At least 8 characters
                  </li>
                  <li className={passwordChecks.uppercase ? styles.valid : styles.invalid}>
                    {passwordChecks.uppercase ? '✓' : '✗'} One uppercase letter
                  </li>
                  <li className={passwordChecks.lowercase ? styles.valid : styles.invalid}>
                    {passwordChecks.lowercase ? '✓' : '✗'} One lowercase letter
                  </li>
                  <li className={passwordChecks.number ? styles.valid : styles.invalid}>
                    {passwordChecks.number ? '✓' : '✗'} One number
                  </li>
                  <li className={passwordChecks.special ? styles.valid : styles.invalid}>
                    {passwordChecks.special ? '✓' : '✗'} One special character (@$!%*?&)
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>I am a:</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  value="customer"
                  checked={formData.role === 'customer'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
                Customer
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  value="vendor"
                  checked={formData.role === 'vendor'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
                Vendor
              </label>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
