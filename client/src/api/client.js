export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(path, options) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || 'Request failed');
  return data;
}

export const api = {
  getMe: () => request('/me').then((d) => d.user),
  getFeed: () => request('/feed').then((d) => d.profiles),
  getMatches: () => request('/matches').then((d) => d.matches),
  swipe: (profileId, action) =>
    request('/swipe', { method: 'POST', body: JSON.stringify({ profileId, action }) }),
};
