import { createContext, useContext, useCallback, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';

const ApiContext = createContext();

export function ApiProvider({ children }) {
  const { token } = useAuth();
  const [tagVersions, setTagVersions] = useState({});

  const invalidate = useCallback((tags = []) => {
    setTagVersions(prev => {
      const next = { ...prev };
      tags.forEach(tag => { next[tag] = (next[tag] || 0) + 1; });
      return next;
    });
  }, []);

  const request = useCallback(async (resource, options = {}) => {
    const { invalidates, ...fetchOptions } = options;

    const headers = { 'Content-Type': 'application/json', ...fetchOptions.headers };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${import.meta.env.VITE_API_URL}${resource}`, {
      ...fetchOptions,
      headers,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed with ${res.status}`);
    }

    if (invalidates) invalidate(invalidates);
    return res.status === 204 ? null : res.json();
  }, [token, invalidate]);

  return (
    <ApiContext.Provider value={{ request, tagVersions }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  return useContext(ApiContext);
}