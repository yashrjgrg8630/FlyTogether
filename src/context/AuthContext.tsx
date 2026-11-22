import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService, tokenStore } from "@/services";
import type { LoginPayload, RegisterPayload, User } from "@/types";

interface AuthState {
  user: User | null;
  ready: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (p: LoginPayload) => Promise<User>;
  register: (p: RegisterPayload) => Promise<User>;
  logout: () => void;
}
const AuthContext = createContext<AuthState | null>(null);
const USER_KEY = "flytogether_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = tokenStore.get();
    const cached = localStorage.getItem(USER_KEY);
    if (!token) {
      setReady(true);
      return;
    }
    if (cached) setUser(JSON.parse(cached));
    authService
      .me()
      .then((u) => {
        setUser(u);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
      })
      .catch(() => {
        tokenStore.clear();
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const persist = (token: string, u: User) => {
    tokenStore.set(token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    return u;
  };
  const login = useCallback(async (p: LoginPayload) => {
    const r = await authService.login(p);
    return persist(r.access_token, r.user);
  }, []);
  const register = useCallback(async (p: RegisterPayload) => {
    const r = await authService.register(p);
    return persist(r.access_token, r.user);
  }, []);
  const logout = useCallback(() => {
    tokenStore.clear();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
    }),
    [user, ready, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
