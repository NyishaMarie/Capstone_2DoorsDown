// resource: the API path, e.g. '/tools'
  // token: the logged-in user's auth token, or null/undefined if not logged in
  // options: extra fetch settings like { method: 'POST', body: ... } — defaults to {} if not passed
async function apiRequest(resource, token, options = {}) {
  // Headers are labels on a package — extra info about the request.
    const headers = { 'Content-Type': 'application/json', ...options.headers };
  //users don't need token to browse tools but if they do, they need bearer infront of their token.
    if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${import.meta.env.VITE_API_URL}${resource}`, {
    ...options,
    headers,
  });

//res.ok is true for successful status codes (200-299), false otherwise.
// If the request failed, try to read the server's error message from the response body.
// If that fails too (e.g. empty body), fall back to an empty object so app doesn't crash.   
if (!res.ok) {
    let body;
        try {
         body = await res.json();
        } catch {
        body = {};
        }
    // If something goes wrong, stop here and raise an error to the component that called it. Either the server's message, or a generic
    // fallback that includes the HTTP status code (e.g. "Request failed with 404").
    throw new Error(body.error || `Request failed with ${res.status}`);
  }

  // If the status is exactly 204 (succeeded, but nothing to send back), return null.
// Otherwise the response has real data — parse it into JSON and return that.
// Example: GET /tools → status 200, body has data, so res.json() runs.
// Example: DELETE /tools/5 → status 204, body is empty, so we return null instead.
  return res.status === 204 ? null : res.json();
}

export default apiRequest;