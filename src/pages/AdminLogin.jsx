import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import { apiRequest } from '../services/apiClient';
import { setAdminSession } from '../utils/adminStorage';

const AdminLogin = () => {
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = event.target.elements.adminEmail.value.trim();
    const password = event.target.elements.adminPassword.value;

    if (!email || !password) {
      setMessage('Please provide email and password.');
      setIsError(true);
      return;
    }

    try {
      setMessage('Signing in...');
      setIsError(false);
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (data.role?.toLowerCase() !== 'admin') {
        setMessage('Access denied. Admin role is required.');
        setIsError(true);
        return;
      }

      setAdminSession(data.token, {
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        expiresAt: data.expiresAt
      });

      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setMessage(err.message || 'Login failed.');
      setIsError(true);
    }
  };

  return (
    <AdminLayout>
      <main className="admin-auth-body">
        <section className="admin-auth-card">
          <p className="admin-badge">Book Basqet</p>
          <h1>Admin Portal</h1>
          <p className="admin-subtitle">
            Sign in with an administrator account to manage books, categories, and orders.
          </p>

          <form className="admin-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="adminEmail">Email</label>
            <input id="adminEmail" name="adminEmail" type="email" required placeholder="admin@bookbasqet.com" />

            <label htmlFor="adminPassword">Password</label>
            <input id="adminPassword" name="adminPassword" type="password" required placeholder="Enter password" />

            <button type="submit" className="btn-primary">
              Sign in
            </button>
            <p className={`form-message ${isError ? 'error' : ''}`} aria-live="polite">
              {message}
            </p>
          </form>
        </section>
      </main>
    </AdminLayout>
  );
};

export default AdminLogin;
