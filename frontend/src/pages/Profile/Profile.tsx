import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  MapPin,
  Heart,
  Ticket,
  Star,
  Bell,
  Smartphone,
  CreditCard,
  Truck,
  CheckCircle2,
  ChevronRight,
  Store,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFavoriteStore } from '@/store/favoriteStore';
import { useToastStore } from '@/store/toastStore';
import { ORDER_STATUS_MAP, USER_ROLE_MAP } from '@/data/mockData';
import { mockApi } from '@/services/mockApi';
import { mockProducts } from '@/data/mockData';
import { setProductImageFallback } from '@/utils/imageFallback';
import { formatPhone } from '@/utils/format';
import './Profile.css';

type ProfileData = Awaited<ReturnType<typeof mockApi.getProfileData>>;

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { favoriteIds, count: favoriteCount } = useFavoriteStore();
  const showToast = useToastStore((state) => state.show);
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const favoriteProducts = mockProducts.filter((p) => favoriteIds.includes(p.id));

  const loadData = async () => {
    const profileData = await mockApi.getProfileData();
    setData(profileData);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    let mounted = true;
    loadData().then(() => {
      if (!mounted) return;
    });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, navigate]);

  const handleMarkRead = async (id: number) => {
    const updated = await mockApi.markNotificationRead(id);
    setData((prev) => (prev ? { ...prev, notifications: updated } : null));
  };

  const handleMarkAllRead = async () => {
    const updated = await mockApi.markAllNotificationsRead();
    setData((prev) => (prev ? { ...prev, notifications: updated } : null));
    showToast('已全部标为已读', 'success');
  };

  if (loading || !data || !user) {
    return (
      <main className="profile-page container section" id="profile-page">
        <div className="page-loading">
          <span className="loading-spinner" />
          <span>正在加载模拟用户数据...</span>
        </div>
      </main>
    );
  }

  const { asset, recentOrders, stats, notifications, coupons, addresses } = data;

  const menuItems = [
    { Icon: Package, label: '我的订单', link: '/orders', count: recentOrders.length },
    { Icon: MapPin, label: '收货地址', link: '/addresses', count: addresses.length },
    { Icon: Heart, label: '我的收藏', link: '/favorites', count: favoriteCount },
    { Icon: Ticket, label: '优惠券', link: '/coupons', count: coupons.length },
    { Icon: Star, label: '我的评价', link: '/reviews', count: 3 },
    { Icon: Bell, label: '消息通知', link: '/notifications', count: notifications.filter((item) => !item.read).length },
    ...(user.role === 'CUSTOMER'
      ? [{ Icon: Store, label: '商家入驻', link: '/seller-apply', count: 0 }]
      : []),
    ...(user.role === 'SELLER'
      ? [{ Icon: Store, label: '商家中心', link: '/seller', count: 0 }]
      : []),
  ];

  return (
    <main className="profile-page container section" id="profile-page">
      <div className="profile-layout">
        {/* Left sidebar */}
        <aside className="profile-sidebar">
          {/* User card */}
          <div className="profile-user-card">
            <div className="profile-avatar">
              <span className="avatar-placeholder">
                {user.username.charAt(0)}
              </span>
            </div>
            <h2 className="profile-username">{user.username}</h2>
            <p className="profile-phone">
              <Smartphone size={14} />
              {formatPhone(user.phone)}
            </p>
            <span className="profile-role-badge badge badge-fresh">
              {USER_ROLE_MAP[user.role]?.label ?? '普通会员'}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 'var(--space-3)', width: '100%' }}
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              退出登录
            </button>
          </div>

          {/* Menu */}
          <nav className="profile-menu">
            {menuItems.map(({ Icon, label, link, count }) => (
              <Link to={link} key={label} className="profile-menu-item">
                <span className="menu-icon">
                  <Icon size={18} />
                </span>
                <span className="menu-label">{label}</span>
                {count > 0 && <span className="menu-count">{count}</span>}
                <ChevronRight size={16} className="menu-arrow" />
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="profile-main">
          {/* Stats */}
          <div className="profile-stats">
            {[
              { label: '待付款', value: stats.PENDING, Icon: CreditCard },
              { label: '待发货', value: stats.PAID, Icon: Package },
              { label: '待收货', value: stats.SHIPPED, Icon: Truck },
              { label: '已完成', value: stats.COMPLETED, Icon: CheckCircle2 },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="stat-item card">
                <span className="stat-icon">
                  <Icon size={24} />
                </span>
                <span className="stat-value">{value}</span>
                <span className="stat-label">{label}</span>
              </div>
            ))}
          </div>

          <div className="profile-assets">
            <div className="asset-card">
              <span>账户余额</span>
              <strong>¥{asset.balance.toFixed(2)}</strong>
            </div>
            <div className="asset-card">
              <span>会员积分</span>
              <strong>{asset.points}</strong>
            </div>
            <div className="asset-card">
              <span>可用优惠券</span>
              <strong>{asset.coupons}</strong>
            </div>
          </div>

          {/* Recent orders */}
          <div className="profile-section">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 'var(--text-lg)' }}>最近订单</h3>
              <Link to="/orders" className="section-more">
                查看全部
                <ChevronRight size={16} />
              </Link>
            </div>
            <div className="recent-orders">
              {recentOrders.map((order) => (
                <div key={order.id} className="order-mini-card card">
                  <div className="order-mini-header">
                    <span className="order-no">订单号：{order.orderNo}</span>
                    <span
                      className="order-status"
                      style={{ color: ORDER_STATUS_MAP[order.status]?.color }}
                    >
                      {ORDER_STATUS_MAP[order.status]?.label}
                    </span>
                  </div>
                  <div className="order-mini-items">
                    {order.items.map((item) => (
                      <div key={item.id} className="order-mini-item">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          onError={(event) => setProductImageFallback(event, item.productName)}
                        />
                        <div className="order-mini-info">
                          <span className="order-mini-name">{item.productName}</span>
                          <span className="order-mini-qty">x{item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-mini-footer">
                    <span className="order-mini-time">{order.createdAt}</span>
                    <span className="order-mini-total">¥{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-two-col">
            <section className="profile-panel" id="favorites">
              <div className="section-header">
                <h3 className="section-title" style={{ fontSize: 'var(--text-lg)' }}>我的收藏</h3>
              </div>
              <div className="favorite-list">
                {favoriteProducts.length > 0 ? (
                  favoriteProducts.map((product) => (
                    <Link key={product.id} to={`/product/${product.id}`} className="favorite-item card">
                      <img
                        src={product.coverImage}
                        alt={product.name}
                        onError={(event) => setProductImageFallback(event, product.name)}
                      />
                      <div className="favorite-info">
                        <span className="favorite-name">{product.name}</span>
                        <span className="favorite-price">¥{product.price.toFixed(1)}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="empty-state compact">
                    <span className="empty-icon">
                      <Heart size={32} />
                    </span>
                    <p>暂无收藏商品</p>
                    <Link to="/products" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                      去逛逛
                    </Link>
                  </div>
                )}
              </div>
            </section>

            <section className="profile-panel" id="coupons">
              <div className="section-header">
                <h3 className="section-title" style={{ fontSize: 'var(--text-lg)' }}>可用优惠券</h3>
              </div>
              <div className="coupon-list">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="coupon-item">
                    <strong>¥{coupon.amount}</strong>
                    <div>
                      <span>{coupon.title}</span>
                      <small>满 {coupon.threshold} 可用 · {coupon.expireAt} 到期</small>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="profile-panel" id="notifications">
              <div className="section-header">
                <h3 className="section-title" style={{ fontSize: 'var(--text-lg)' }}>消息通知</h3>
                {notifications.some((n) => !n.read) && (
                  <button className="btn btn-sm btn-secondary" onClick={handleMarkAllRead}>
                    全部已读
                  </button>
                )}
              </div>
              <div className="notice-list">
                {notifications.map((notice) => (
                  <div
                    key={notice.id}
                    className={`notice-item ${notice.read ? '' : 'unread'}`}
                    onClick={() => !notice.read && handleMarkRead(notice.id)}
                    style={{ cursor: notice.read ? 'default' : 'pointer' }}
                  >
                    <strong>{notice.title}</strong>
                    <p>{notice.content}</p>
                    <small>{notice.createdAt}</small>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;
