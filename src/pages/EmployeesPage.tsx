import { useEffect, useState, type FormEvent } from 'react';
import { api, type Employee } from '../api/client';

export default function EmployeesPage() {
  const [items, setItems] = useState<Employee[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Employee@123');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get<Employee[]>('/api/employees');
    setItems(data);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.post('/api/employees', { fullName, email, password });
      setFullName('');
      setEmail('');
      setMessage('تم إنشاء الموظف بنجاح');
      await load();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (err as any).response?.data?.message
          : 'تعذر إنشاء الموظف';
      setError(msg || 'تعذر إنشاء الموظف');
    }
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <h2>إنشاء موظف</h2>
        <p className="muted">أضف موظفاً جديداً ليتمكن من تسجيل الحضور والخروج من التطبيق</p>
        <form className="form row-form" onSubmit={create}>
          <label>
            الاسم
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label>
            البريد
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            كلمة المرور
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit">إضافة موظف</button>
        </form>
        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>الموظفون ({items.length})</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>الاسم</th>
                <th>البريد</th>
                <th>بصمة الوجه</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>{e.fullName}</td>
                  <td>{e.email}</td>
                  <td>
                    <span className={`badge ${e.hasFaceRegistered ? 'ok' : 'open'}`}>
                      {e.hasFaceRegistered ? 'مسجّلة' : 'غير مسجّلة'}
                    </span>
                  </td>
                  <td>{e.isActive ? 'نشط' : 'موقوف'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
