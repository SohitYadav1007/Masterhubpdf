import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, handleRedirectResult, ADMIN_EMAIL } from './firebase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    handleRedirectResult().catch(() => {});
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAdmin(firebaseUser.email === ADMIN_EMAIL);
        try {
          const { logUser } = await import('./api');
          logUser({ uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName }).catch(() => {});
        } catch {}
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return <AuthContext.Provider value={{ user, loading, isAdmin }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
