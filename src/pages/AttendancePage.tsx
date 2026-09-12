import { useEffect, useMemo, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import dayjs from 'dayjs';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { API_BASE, api, type Attendance } from '../api/client';

function statusLabel(status: string) {
  if (status === 'Completed') return 'مكتمل';
  if (status === 'Open') return 'حاضر';
  return status;
}

export default function AttendancePage() {
  const [items, setItems] = useState<Attendance[]>([]);
  const [selected, setSelected] = useState<Attendance | null>(null);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  async function load() {
    const params: Record<string, string> = {};
    if (from) params.from = new Date(from).toISOString();
    if (to) params.to = new Date(`${to}T23:59:59`).toISOString();
    const { data } = await api.get<Attendance[]>('/api/attendance', { params });
    setItems(data);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));

    const token = localStorage.getItem('token');
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/attendance?access_token=${token}`)
      .withAutomaticReconnect()
      .build();

    connection.on('attendanceUpdated', (row: Attendance) => {
      setItems((prev) => {
        const rest = prev.filter((x) => x.id !== row.id);
        return [row, ...rest];
      });
    });

    connection.start().catch(() => undefined);
    return () => {
      connection.stop();
    };
  }, []);

  async function exportExcel() {
    setExporting(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (from) params.from = new Date(from).toISOString();
      if (to) params.to = new Date(`${to}T23:59:59`).toISOString();
      const res = await api.get('/api/attendance/export', {
        params,
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${dayjs().format('YYYYMMDD_HHmm')}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'فشل التصدير');
    } finally {
      setExporting(false);
    }
  }

  const mapCenter = useMemo(() => {
    if (selected) {
      return [selected.checkInLatitude, selected.checkInLongitude] as [number, number];
    }
    if (items[0]) {
      return [items[0].checkInLatitude, items[0].checkInLongitude] as [number, number];
    }
    return [33.3152, 44.3661] as [number, number];
  }, [selected, items]);

  const presentCount = items.filter((x) => x.status === 'Open').length;
  const completedCount = items.filter((x) => x.status === 'Completed').length;

  return (
    <div className="page-stack">
      <section className="stats-row">
        <div className="stat-card">
          <span>إجمالي السجلات</span>
          <strong>{items.length}</strong>
        </div>
        <div className="stat-card">
          <span>حاضر الآن</span>
          <strong>{presentCount}</strong>
        </div>
        <div className="stat-card">
          <span>مكتمل (خروج)</span>
          <strong>{completedCount}</strong>
        </div>
      </section>

      <div className="page-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>سجلات الحضور والخروج</h2>
              <p className="muted">تحديث لحظي عبر SignalR</p>
            </div>
            <div className="actions">
              <button type="button" className="secondary" onClick={() => load()}>
                تحديث
              </button>
              <button type="button" onClick={exportExcel} disabled={exporting}>
                {exporting ? 'جاري التصدير...' : 'تصدير Excel'}
              </button>
            </div>
          </div>

          <div className="filters">
            <label>
              من تاريخ
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label>
              إلى تاريخ
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
            <button type="button" className="secondary" onClick={() => load()}>
              تطبيق الفلتر
            </button>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>الموظف</th>
                  <th>الحضور</th>
                  <th>الخروج</th>
                  <th>المدة</th>
                  <th>صورة</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr
                    key={a.id}
                    className={selected?.id === a.id ? 'selected' : ''}
                    onClick={() => setSelected(a)}
                  >
                    <td>
                      <div className="emp-cell">
                        <strong>{a.employeeName}</strong>
                        <small>{a.workLocationName || '-'}</small>
                      </div>
                    </td>
                    <td>{dayjs(a.checkInAt).format('YYYY-MM-DD HH:mm')}</td>
                    <td>
                      {a.checkOutAt ? dayjs(a.checkOutAt).format('HH:mm') : '—'}
                    </td>
                    <td>{a.durationHours != null ? `${a.durationHours} س` : '—'}</td>
                    <td>
                      {a.checkInProofImageUrl ? (
                        <img
                          className="thumb"
                          src={`${API_BASE}${a.checkInProofImageUrl}`}
                          alt="proof"
                        />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <span className={`badge ${a.status === 'Completed' ? 'ok' : 'open'}`}>
                        {statusLabel(a.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel map-panel">
          <h2>موقع الحضور على الخريطة</h2>
          <MapContainer
            key={`${mapCenter[0]}-${mapCenter[1]}`}
            center={mapCenter}
            zoom={16}
            style={{ height: '100%', minHeight: 420, width: '100%', borderRadius: 12 }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {(selected ? [selected] : items.slice(0, 20)).map((a) => (
              <Marker key={a.id} position={[a.checkInLatitude, a.checkInLongitude]}>
                <Popup>
                  {a.employeeName}
                  <br />
                  حضور: {dayjs(a.checkInAt).format('HH:mm')}
                  {a.checkOutAt ? (
                    <>
                      <br />
                      خروج: {dayjs(a.checkOutAt).format('HH:mm')}
                    </>
                  ) : null}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </section>
      </div>
    </div>
  );
}
