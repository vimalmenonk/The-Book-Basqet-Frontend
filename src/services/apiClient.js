export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001/api';

const parsePayload = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const apiRequest = async (path, options = {}) => {
  const { token, headers, ...rest } = options;
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...(headers || {})
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders
  });

  const payload = await parsePayload(response);
  if (!response.ok || payload?.success === false) {
    const message = payload?.message || payload?.title || payload?.error || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload?.data ?? payload;
};
