import { apiRequest } from './apiClient';

export const loginRequest = async (email, password) => {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

export const registerRequest = async (fullName, email, password) => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password })
  });
};
