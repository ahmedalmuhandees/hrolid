import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('admin@attendance.local');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (err as any).response?.data?.message
          : err instanceof Error
            ? err.message
            : 'فشل تسجيل الدخول';
      setError(msg || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={onSubmit}>
        <h1>لوحة تحكم الحضور</h1>
        <p className="muted">إدارة المواقع والموظفين وسجلات الحضور والخروج</p>
        <label>
          البريد الإلكتروني
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          كلمة المرور
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'جاري الدخول...' : 'دخول'}
        </button>
        <p className="hint">admin@attendance.local / Admin@123</p>
      </form>
    </div>
  );
}
