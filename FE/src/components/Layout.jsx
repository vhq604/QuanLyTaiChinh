import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const SIDEBAR_STORAGE_KEY = 'sidebarCollapsed';

const NAV_ITEMS = [
  { to: '/', icon: '📊', label: 'Dashboard' },
  { to: '/transactions', icon: '💸', label: 'Giao Dịch' },
  { to: '/accounts', icon: '💳', label: 'Tài Khoản / Ví' },
  { to: '/categories', icon: '🏷️', label: 'Danh Mục' }
];

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarClass = collapsed ? 'sidebar sidebar--collapsed' : 'sidebar';

  return (
    <div className="app-shell">
      <aside className={sidebarClass}>
        <div>
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <span className="sidebar-brand-icon">💎</span>
              <span className="sidebar-brand-text">FinanceFlow</span>
            </div>
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() => setCollapsed((prev) => !prev)}
              title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
              aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              {collapsed ? '»' : '«'}
            </button>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span className="sidebar-link-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.username?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.username || 'User'}</span>
              <span className="sidebar-user-email">{user?.email || ''}</span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
            title={collapsed ? 'Đăng xuất' : undefined}
          >
            <span>🚪</span>
            <span className="sidebar-logout-label">Đăng Xuất</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="main-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
