import { apiRequest } from './apiClient';

export const fetchBooks = async (token) => apiRequest('/books', { token });

export const createBook = async (payload, token) =>
  apiRequest('/books', { method: 'POST', body: JSON.stringify(payload), token });

export const updateBook = async (id, payload, token) =>
  apiRequest(`/books/${id}`, { method: 'PUT', body: JSON.stringify(payload), token });

export const deleteBook = async (id, token) =>
  apiRequest(`/books/${id}`, { method: 'DELETE', token });
