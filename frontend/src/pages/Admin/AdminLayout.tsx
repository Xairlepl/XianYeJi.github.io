import { useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  Store,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import './Admin.css';

const navItems = [
  { to: '/admin', label: '数据看板', Icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: '商品管理', Icon: Package, end: false },
  { to: '/admin/orders', label: '订单管理', Icon: ClipboardList, end: false },
  { to: '/admin/users', label: '用户管理', Icon: Users, end: false },
  { to: '/admin/applications', label: '入驻审核', Icon: Store, end: false },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const showToast = useToastStore((state) => state.show);

  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    if (!isAdmin) {
      showToast('该页面仅管理员可访问', 'error');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, showToast]);

  if (!isAdmin) return null;

  return (
    <div className="admin-layout" id="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-brand">
          <span className="admin-brand-mark">
            <ShieldCheck size={20} />
          </span>
          <span className="admin-brand-copy">
            <strong>鲜野集</strong>
            <small>管理员门户</small>
          </span>
        </Link>

        <nav className="admin-nav">
          {navItems.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-link">
            <Store size={18} />
            返回商城
          </Link>
          <button
            type="button"
            className="admin-nav-link admin-logout"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut size={18} />
            退出登录
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <span className="admin-topbar-title">运营管理控制台</span>
          <div className="admin-topbar-user">
            <span className="admin-user-avatar">{user!.username.charAt(0).toUpperCase()}</span>
            <span className="admin-user-name">{user!.username}</span>
            <span className="admin-user-role">管理员</span>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
