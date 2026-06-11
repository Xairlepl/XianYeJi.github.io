import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ORDER_STATUS_MAP } from '../../data/mockData';
import { mockApi } from '../../services/mockApi';
import { setProductImageFallback } from '../../utils/imageFallback';
import './Profile.css';

type ProfileData = Awaited<ReturnType<typeof mockApi.getProfileData>>;

const Profile = () => {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    mockApi.getProfileData().then((profileData) => {
      if (!mounted) return;
      setData(profileData);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !data) {
    return (
      <main className="profile-page container section" id="profile-page">
        <div className="page-loading">
          <span className="loading-spinner" />
          <span>正在加载模拟用户数据...</span>
        </div>
      </main>
    );
  }

  const { user, asset, recentOrders, stats, notifications, coupons, addresses } = data;

  const menuItems = [
    { icon: '📦', label: '我的订单', link: '/orders', count: recentOrders.length },
    { icon: '📍', label: '收货地址', link: '#addresses', count: addresses.length },
    { icon: '❤️', label: '我的收藏', link: '#', count: asset.favorites },
    { icon: '🎫', label: '优惠券', link: '#coupons', count: coupons.length },
    { icon: '⭐', label: '我的评价', link: '#', count: 5 },
    { icon: '💬', label: '消息通知', link: '#notifications', count: notifications.filter((item) => !item.read).length },
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
            <p className="profile-phone">📱 {user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</p>
            <span className="profile-role-badge badge badge-fresh">
              {user.role === 'CUSTOMER' ? '普通会员' : '商家'}
            </span>
          </div>

          {/* Menu */}
          <nav className="profile-menu">
            {menuItems.map((item) => (
              <Link to={item.link} key={item.label} className="profile-menu-item">
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
                {item.count > 0 && <span className="menu-count">{item.count}</span>}
                <span className="menu-arrow">›</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="profile-main">
          {/* Stats */}
          <div className="profile-stats">
            {[
              { label: '待付款', value: stats.PENDING, icon: '💳' },
              { label: '待发货', value: stats.PAID, icon: '📦' },
              { label: '待收货', value: stats.SHIPPED, icon: '🚚' },
              { label: '已完成', value: stats.COMPLETED, icon: '✅' },
            ].map((stat) => (
              <div key={stat.label} className="stat-item card">
                <span className="stat-icon">{stat.icon}</span>
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
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
              <Link to="/orders" className="section-more">查看全部 →</Link>
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
              </div>
              <div className="notice-list">
                {notifications.map((notice) => (
                  <div key={notice.id} className={`notice-item ${notice.read ? '' : 'unread'}`}>
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
