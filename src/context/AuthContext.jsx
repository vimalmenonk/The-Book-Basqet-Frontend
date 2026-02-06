import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginRequest, registerRequest } from '../services/authService';
import {
  clearStoredToken,
  getStoredToken,
  getStoredUser,
  setStoredToken
} from '../utils/authStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    setToken(getStoredToken());
    setUser(getStoredUser());
  }, []);

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    setStoredToken(data?.token, data?.expiresAt, {
      fullName: data?.fullName,
      email: data?.email,
      role: data?.role
    });
    setToken(data?.token);
    setUser({
      fullName: data?.fullName,
      email: data?.email,
      role: data?.role
    });
    return data;
  };

  const register = async (fullName, email, password) => {
    const data = await registerRequest(fullName, email, password);
    setStoredToken(data?.token, data?.expiresAt, {
      fullName: data?.fullName,
      email: data?.email,
      role: data?.role
    });
    setToken(data?.token);
    setUser({
      fullName: data?.fullName,
      email: data?.email,
      role: data?.role
    });
    return data;
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
