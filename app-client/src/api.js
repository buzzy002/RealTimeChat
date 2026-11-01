function getCookie(name) {
  const prefix = name + '=';
  const row = document.cookie.split('; ').find((r) => r.startsWith(prefix));
  return row ? decodeURIComponent(row.slice(prefix.length)) : null;
}

// Methods that doesn't require CSRF
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  let payload;

  if (!SAFE_METHODS.includes(method)) {
    headers['X-CSRFToken'] = getCookie('csrftoken') ?? '';
  }

  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  try {
    const response = await fetch(`/api${path}`, {
      method,
      headers,
      body: payload,
      credentials: 'same-origin',
    });
    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

export function errorMessages(data) {
  if (!data?.errors) return ['An unexpected error occured.'];
  return Object.values(data.errors).flat().map((e) => e.message);
}