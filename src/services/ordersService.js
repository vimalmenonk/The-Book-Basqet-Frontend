import { apiRequest } from './apiClient';

export const fetchOrders = async (token) => apiRequest('/orders', { token });

export const updateOrderStatus = async (id, status, token) =>
  apiRequest(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
    token
  });
