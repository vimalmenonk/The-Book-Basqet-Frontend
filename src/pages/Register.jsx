import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/shop', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const fullName = event.target.elements.fullName.value.trim();
    const email = event.target.elements.registerEmail.value.trim();
    const password = event.target.elements.registerPassword.value;
    const confirmPassword = event.target.elements.confirmPassword.value;

    if (fullName.length < 2 || fullName.length > 120) {
      setMessage('Full name should be between 2 and 120 characters.');
      setIsError(true);
      return;
    }

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

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setIsError(true);
      return;
    }

    setMessage('Creating your account...');
    setIsError(false);

    try {
      await register(fullName, email, password);
      setMessage('Registration successful. Redirecting...');
      navigate('/shop', { replace: true });
    } catch (err) {
      setMessage(err.message || 'Registration failed.');
      setIsError(true);
    }
  };

  return (
    <main className="section">
      <div className="container auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Join Book Basqet</p>
          <h1>Create Your Account</h1>
          <p>Register to save your cart and start shopping.</p>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              placeholder="Your full name"
            />

            <label htmlFor="registerEmail">Email</label>
            <input
              id="registerEmail"
              name="registerEmail"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />

            <label htmlFor="registerPassword">Password</label>
            <input
              id="registerPassword"
              name="registerPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Re-enter your password"
            />

            <button className="btn btn-primary" type="submit">
              Create Account
            </button>
            <p className="form-message" style={{ color: isError ? 'crimson' : 'green' }} aria-live="polite">
              {message}
            </p>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Login here</Link>.
          </p>
        </section>
      </div>
    </main>
  );
};

export default Register;
