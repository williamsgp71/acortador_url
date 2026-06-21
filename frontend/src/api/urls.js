const API_BASE = '/api/urls';

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

export async function createShortUrl(accessToken, originalUrl) {
  return request('/shorten', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ original_url: originalUrl }),
  });
}

export async function listUrls(accessToken) {
  return request('', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function getUrlStats(accessToken, shortCode) {
  return request(`/${shortCode}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function deleteUrl(accessToken, shortCode) {
  return request(`/${shortCode}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}