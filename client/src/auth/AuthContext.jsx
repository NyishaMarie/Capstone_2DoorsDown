import { createContext, useContext } from 'react';

const AuthContext = createContext();

// temporary stub. Replaced by the real version in N-06.
export function AuthProvider({ children }) {
  return (
    <AuthContext.Provider value={{ token: null, user: null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}