import { useEffect, useState, type FormEvent } from 'react';
import { MapContainer, Marker, Circle, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { api, type WorkLocation } from '../api/client';

// Fix default marker icons in Vite
// @ts-expect-error leaflet icon patch
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function ClickPicker({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationsPage() {
  const [items, setItems] = useState<WorkLocation[]>([]);
  const [name, setName] = useState('الموقع الرئيسي');
  const [lat, setLat] = useState(33.3152);
  const [lng, setLng] = useState(44.3661);
  const [radius, setRadius] = useState(100);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  async function load() {
    const { data } = await api.get<WorkLocation[]>('/api/locations');
    setItems(data);
    const active = data.find((x) => x.isActive) ?? data[0];
    if (active) {
      setLat(active.latitude);
      setLng(active.longitude);
      setRadius(active.radiusMeters);
      setName(active.name);
      setEditingId(active.id);
    }
  }

  useEffect(() => {
    load().catch((e) => setMessage(e.message));
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    const payload = {
      name,
      latitude: lat,
      longitude: lng,
      radiusMeters: radius,
      isActive: true,
    };
    if (editingId) {
      await api.put(`/api/locations/${editingId}`, payload);
      setMessage('تم تحديث موقع العمل');
    } else {
      await api.post('/api/locations', payload);
      setMessage('تم إنشاء موقع العمل');
    }
    await load();
  }

  return (
    <div className="page-grid">
      <section className="panel">
        <h2>تحديد موقع العمل (Geofence)</h2>
        <p className="muted">انقر على الخريطة لإدراج النقطة، ثم حدد نصف القطر بالمتر.</p>
        <form className="form" onSubmit={save}>
          <label>
            اسم الموقع
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <div className="row">
            <label>
              Latitude
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
              />
            </label>
            <label>
              Longitude
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
              />
            </label>
          </div>
          <label>
            نصف القطر (متر)
            <input
              type="number"
              min={10}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
            />
          </label>
          <button type="submit">حفظ الموقع النشط</button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setEditingId(null);
              setName('موقع جديد');
            }}
          >
            إنشاء كموقع جديد
          </button>
          {message && <div className="success">{message}</div>}
        </form>
        <ul className="list">
          {items.map((x) => (
            <li key={x.id}>
              <button
                type="button"
                className="linkish"
                onClick={() => {
                  setEditingId(x.id);
                  setName(x.name);
                  setLat(x.latitude);
                  setLng(x.longitude);
                  setRadius(x.radiusMeters);
                }}
              >
                {x.name} {x.isActive ? '(نشط)' : ''} — {x.radiusMeters}م
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="panel map-panel">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          style={{ height: '100%', minHeight: 480, width: '100%', borderRadius: 12 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickPicker
            onPick={(a, b) => {
              setLat(Number(a.toFixed(6)));
              setLng(Number(b.toFixed(6)));
            }}
          />
          <Marker position={[lat, lng]} />
          <Circle
            center={[lat, lng]}
            radius={radius}
            pathOptions={{ color: '#0f766e', fillColor: '#14b8a6', fillOpacity: 0.2 }}
          />
        </MapContainer>
      </section>
    </div>
  );
}
