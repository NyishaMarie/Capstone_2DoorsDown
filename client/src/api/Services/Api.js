async function apiRequest(resource, token, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${import.meta.env.VITE_API_URL}${resource}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let body;
        try {
         body = await res.json();
        } catch {
        body = {};
        }
    throw new Error(body.error || `Request failed with ${res.status}`);
  }

  return res.status === 204 ? null : res.json();
}

export default apiRequest;