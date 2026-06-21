const API_BASE = '/api/auth';

async function request(path, options = {}) {
  const { headers, ...restOptions } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...restOptions,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

export async function login(username, password) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function register(email, username, password) {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password }),
  });
}

export async function refreshToken(refreshToken) {
  return request('/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function getMe(accessToken) {
  const response = await fetch(`${API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user');
  }

  return response.json();
}

export async function logout(accessToken, refreshToken) {
  return request('/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}