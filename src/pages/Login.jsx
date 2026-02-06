import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const getRedirectTarget = (params) => {
  const redirect = params.get('redirect');
  if (!redirect || redirect.startsWith('http')) return '/shop';
  return redirect;
};

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getRedirectTarget(searchParams), { replace: true });
    }
  }, [isAuthenticated, navigate, searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = event.target.elements.loginEmail.value.trim();
    const password = event.target.elements.loginPassword.value;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email address.');
      setIsError(true);
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      setIsError(true);
      return;
    }

    setMessage('Signing you in...');
    setIsError(false);

    try {
      await login(email, password);
      setMessage('Login successful. Redirecting...');
      navigate(getRedirectTarget(searchParams), { replace: true });
    } catch (err) {
      setMessage(err.message || 'Login failed.');
      setIsError(true);
    }
  };

  return (
    <main className="section">
      <div className="container auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Welcome Back</p>
          <h1>Login to Book Basqet</h1>
          <p>Sign in to manage your cart and checkout faster.</p>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="loginEmail">Email</label>
            <input
              id="loginEmail"
              name="loginEmail"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />

            <label htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              name="loginPassword"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              placeholder="Enter your password"
            />

            <button className="btn btn-primary" type="submit">
              Login
            </button>
            <p className="form-message" style={{ color: isError ? 'crimson' : 'green' }} aria-live="polite">
              {message}
            </p>
          </form>
          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>.
          </p>
        </section>
      </div>
    </main>
  );
};

export default Login;
