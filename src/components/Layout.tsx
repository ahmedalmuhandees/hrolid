import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <strong>لوحة الحضور</strong>
          <span>{user.fullName}</span>
        </div>
        <nav>
          <NavLink to="/" end>
            المواقع
          </NavLink>
          <NavLink to="/employees">الموظفون</NavLink>
          <NavLink to="/attendance">الحضور والخروج</NavLink>
        </nav>
        <button type="button" className="secondary logout" onClick={logout}>
          خروج
        </button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
