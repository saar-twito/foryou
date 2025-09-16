import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.scss';
import { authAPI } from '../../services/authAPI';

interface LoginProps {
  onClose: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
  name?: string;
}

const Login: React.FC<LoginProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  // Base validation fields
  const emailField = yup
    .string()
    .email('Invalid email format')
    .required('Email is required');

  const passwordField = yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required');

  const nameField = yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .matches(/^[a-zA-Z0-9]+$/, 'Name can only contain letters and numbers')
    .required('Name is required');

  // Validation schemas
  const loginSchema = yup.object().shape({
    email: emailField,
    password: passwordField,
  });

  const registerSchema = yup.object().shape({
    email: emailField,
    password: passwordField,
    name: nameField,
  });

  // Use the appropriate schema based on form mode
  const currentSchema = useMemo(() =>
    isLogin ? loginSchema : registerSchema, [isLogin]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginFormData>({
    resolver: yupResolver(currentSchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const success = await login(data.email, data.password);
        if (success) {
          onClose(); // Close the modal on successful login
        } else {
          setError('Invalid credentials');
        }
      } else {
        // Handle registration - role defaults to 'customer' in backend
        const result = await authAPI.register(data.email, data.password, data.name!);
        if (result.user) {
          // Auto-login after registration
          await login(data.email, data.password);
          onClose();
        } else {
          setError('Registration failed');
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setError('');
    reset(); // Clear form data and validation errors
  };

  return (
    <div className={styles.overlay}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.loginForm}>
        <h2>{isLogin ? 'Login' : 'Register'}</h2>

        {error && <div className={styles.error}>{error}</div>}

        <div>
          <input
            type="email"
            placeholder="Email"
            {...register('email')}
            className={errors.email ? styles.errorInput : ''}
          />
          {errors.email && (
            <span className={styles.fieldError}>{errors.email.message}</span>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            {...register('password')}
            className={errors.password ? styles.errorInput : ''}
          />
          {errors.password && (
            <span className={styles.fieldError}>{errors.password.message}</span>
          )}
        </div>

        {!isLogin && (
          <div>
            <input
              type="text"
              placeholder="Name"
              {...register('name')}
              className={errors.name ? styles.errorInput : ''}
            />
            {errors.name && (
              <span className={styles.fieldError}>{errors.name.message}</span>
            )}
          </div>
        )}

        <div className={styles.formActions}>
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>

        <p className={styles.switchMode}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={handleModeSwitch}
            className={styles.switchButton}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;