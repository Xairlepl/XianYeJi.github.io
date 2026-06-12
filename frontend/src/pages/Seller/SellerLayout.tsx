import { useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Store,
  LogOut,
  ShoppingBasket,
  MessageCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import '../Admin/Admin.css';

const navItems = [
  { to: '/seller', label: '经营工作台', Icon: LayoutDashboard, end: true },
  { to: '/seller/products', label: '我的商品', Icon: Package, end: false },
  { to: '/seller/orders', label: '店铺订单', Icon: ClipboardList, end: false },
  { to: '/seller/service', label: '商家客服', Icon: MessageCircle, end: false },
];

const SellerLayout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const showToast = useToastStore((state) => state.show);

  const isSeller = isAuthenticated && user?.role === 'SELLER';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    if (user?.role === 'ADMIN') {
      showToast('管理员请使用管理后台', 'info');
      navigate('/admin', { replace: true });
      return;
    }
    if (!isSeller) {
      showToast('商家中心仅对入驻商家开放，可先提交入驻申请', 'info');
      navigate('/seller-apply', { replace: true });
    }
  }, [isAuthenticated, isSeller, user?.role, navigate, showToast]);

  if (!isSeller) return null;

  return (
    <div className="admin-layout seller-theme" id="seller-layout">
      <aside className="admin-sidebar">
        <Link to="/seller" className="admin-brand">
          <span className="admin-brand-mark">
            <ShoppingBasket size={20} />
          </span>
          <span className="admin-brand-copy">
            <strong>{user!.shopName ?? '我的店铺'}</strong>
            <small>商家经营中心</small>
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
          <span className="admin-topbar-title">店铺运营控制台</span>
          <div className="admin-topbar-user">
            <span className="admin-user-avatar">{user!.username.charAt(0).toUpperCase()}</span>
            <span className="admin-user-name">{user!.username}</span>
            <span className="admin-user-role role-seller">入驻商家</span>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
