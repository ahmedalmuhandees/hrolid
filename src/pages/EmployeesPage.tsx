import { useEffect, useState, type FormEvent } from 'react';
import { api, type Employee, type WorkLocation } from '../api/client';

export default function EmployeesPage() {
  const [items, setItems] = useState<Employee[]>([]);
  const [locations, setLocations] = useState<WorkLocation[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Employee@123');
  const [createLocationIds, setCreateLocationIds] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLocationIds, setEditLocationIds] = useState<number[]>([]);
  const [savingLocations, setSavingLocations] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const [{ data: employees }, { data: locs }] = await Promise.all([
      api.get<Employee[]>('/api/employees'),
      api.get<WorkLocation[]>('/api/locations'),
    ]);
    setItems(employees);
    setLocations(locs);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  function toggleId(ids: number[], id: number) {
    return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  }

  async function create(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.post('/api/employees', {
        fullName,
        email,
        password,
        locationIds: createLocationIds,
      });
      setFullName('');
      setEmail('');
      setCreateLocationIds([]);
      setMessage('تم إنشاء الموظف بنجاح');
      await load();
    } catch (err: unknown) {
      setError(apiError(err, 'تعذر إنشاء الموظف'));
    }
  }

  function startEdit(employee: Employee) {
    setEditingId(employee.id);
    setEditLocationIds((employee.locations ?? []).map((x) => x.id));
    setMessage('');
    setError('');
  }

  async function saveLocations() {
    if (editingId == null) return;
    setSavingLocations(true);
    setMessage('');
    setError('');
    try {
      await api.put(`/api/employees/${editingId}/locations`, {
        locationIds: editLocationIds,
      });
      setMessage('تم تحديث مواقع الموظف');
      setEditingId(null);
      await load();
    } catch (err: unknown) {
      setError(apiError(err, 'تعذر تحديث المواقع'));
    } finally {
      setSavingLocations(false);
    }
  }

  async function removeEmployee(employee: Employee) {
    const ok = window.confirm(
      `حذف الموظف «${employee.fullName}»؟\nسيتم حذف جميع سجلات الحضور والخروج الخاصة به.`,
    );
    if (!ok) return;

    setDeletingId(employee.id);
    setMessage('');
    setError('');
    try {
      await api.delete(`/api/employees/${employee.id}`);
      if (editingId === employee.id) setEditingId(null);
      setMessage('تم حذف الموظف وجميع سجلات حضوره وخروجه');
      await load();
    } catch (err: unknown) {
      setError(apiError(err, 'تعذر حذف الموظف'));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <h2>إنشاء موظف</h2>
        <p className="muted">أضف موظفاً جديداً وعيّن له موقعاً أو أكثر لتسجيل الحضور</p>
        <form className="form" onSubmit={create}>
          <div className="row-form">
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
          </div>
          <LocationPicker
            locations={locations}
            selectedIds={createLocationIds}
            onToggle={(id) => setCreateLocationIds((prev) => toggleId(prev, id))}
            hint="إذا لم تحدد مواقع، يمكن للموظف التسجيل من أي موقع نشط."
          />
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
                <th>مواقع الحضور</th>
                <th>بصمة الوجه</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className={editingId === e.id ? 'selected' : undefined}>
                  <td>{e.id}</td>
                  <td>{e.fullName}</td>
                  <td>{e.email}</td>
                  <td>
                    <div className="chip-row">
                      {(e.locations ?? []).length === 0 ? (
                        <span className="muted">كل المواقع النشطة</span>
                      ) : (
                        e.locations.map((loc) => (
                          <span key={loc.id} className="chip">
                            {loc.name}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${e.hasFaceRegistered ? 'ok' : 'open'}`}>
                      {e.hasFaceRegistered ? 'مسجّلة' : 'غير مسجّلة'}
                    </span>
                  </td>
                  <td>{e.isActive ? 'نشط' : 'موقوف'}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="secondary" onClick={() => startEdit(e)}>
                        تعيين المواقع
                      </button>
                      <button
                        type="button"
                        className="danger"
                        disabled={deletingId === e.id}
                        onClick={() => removeEmployee(e)}
                      >
                        {deletingId === e.id ? 'جاري الحذف...' : 'حذف'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingId != null && (
          <div className="assign-box">
            <h3>مواقع الموظف</h3>
            <p className="muted">اختر موقعاً أو أكثر يُسمح لهذا الموظف بتسجيل الحضور منها.</p>
            <LocationPicker
              locations={locations}
              selectedIds={editLocationIds}
              onToggle={(id) => setEditLocationIds((prev) => toggleId(prev, id))}
            />
            <div className="actions">
              <button type="button" onClick={saveLocations} disabled={savingLocations}>
                {savingLocations ? 'جاري الحفظ...' : 'حفظ المواقع'}
              </button>
              <button type="button" className="secondary" onClick={() => setEditingId(null)}>
                إلغاء
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function LocationPicker({
  locations,
  selectedIds,
  onToggle,
  hint,
}: {
  locations: WorkLocation[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  hint?: string;
}) {
  if (locations.length === 0) {
    return <p className="muted">لا توجد مواقع نشطة. أضف مواقع من صفحة المواقع أولاً.</p>;
  }

  return (
    <div>
      <span className="picker-label">مواقع تسجيل الحضور</span>
      <div className="check-grid">
        {locations.map((loc) => (
          <label key={loc.id} className={`check-card ${selectedIds.includes(loc.id) ? 'on' : ''}`}>
            <input
              type="checkbox"
              checked={selectedIds.includes(loc.id)}
              onChange={() => onToggle(loc.id)}
            />
            <span>
              <strong>
                {loc.name}
                {!loc.isActive ? ' (غير نشط)' : ''}
              </strong>
              <small>
                {loc.radiusMeters}م — {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
              </small>
            </span>
          </label>
        ))}
      </div>
      {hint && <p className="muted">{hint}</p>}
    </div>
  );
}

function apiError(err: unknown, fallback: string) {
  if (err && typeof err === 'object' && 'response' in err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (err as any).response?.data?.message || fallback;
  }
  return fallback;
}
