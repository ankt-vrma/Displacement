import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi, setAuthLostHandler, tokens } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(tokens.access));

  useEffect(() => {
    setAuthLostHandler(() => setUser(null));
    if (!tokens.access) return;
    authApi
      .me()
      .then(setUser)
      .catch(() => tokens.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    tokens.set(await authApi.login({ email, password }));
    const me = await authApi.me();
    setUser(me);
    return me;
  }, []);

  const register = useCallback(
    async (fullName, email, password) => {
      await authApi.register({ email, password, full_name: fullName });
      return login(email, password);
    },
    [login]
  );

  const logout = useCallback(() => {
    tokens.clear();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (fields) => {
    const me = await authApi.updateMe(fields);
    setUser(me);
    return me;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile }),
    [user, loading, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);