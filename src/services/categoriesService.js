import { apiRequest } from './apiClient';

export const fetchCategories = async (token) => apiRequest('/categories', { token });

export const createCategory = async (payload, token) =>
  apiRequest('/categories', { method: 'POST', body: JSON.stringify(payload), token });

export const updateCategory = async (id, payload, token) =>
  apiRequest(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload), token });

export const deleteCategory = async (id, token) =>
  apiRequest(`/categories/${id}`, { method: 'DELETE', token });
