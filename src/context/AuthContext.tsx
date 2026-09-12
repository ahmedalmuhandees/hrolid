import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  api,
  setAuthToken,
  type LoginResponse,
} from '../api/client';

type AuthState = {
  user: LoginResponse | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

function loadUser(): LoginResponse | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoginResponse;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(loadUser);

  const value = useMemo<AuthState>(
    () => ({
      user,
      async login(email, password) {
        const { data } = await api.post<LoginResponse>('/api/auth/login', {
          email,
          password,
        });
        if (data.role !== 'Admin') {
          throw new Error('لوحة التحكم مخصصة للأدمن فقط');
        }
        setAuthToken(data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
      },
      logout() {
        setAuthToken(null);
        localStorage.removeItem('user');
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}
