import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, TicketX } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { mockApi } from '@/services/mockApi';
import type { Coupon } from '@/types';
import './Coupons.css';

const Coupons = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    const data = await mockApi.getProfileData();
    setCoupons(data.coupons);
    setLoading(false);
  };

  if (loading) {
    return (
      <main className="coupons-page container section">
        <div className="page-loading">
          <span className="loading-spinner" />
          <span>加载中...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="coupons-page container section">
      <h1 className="page-title">
        <Ticket size={26} />
        我的优惠券
      </h1>

      {coupons.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">
            <TicketX size={40} />
          </span>
          <p>暂无优惠券</p>
        </div>
      ) : (
        <div className="coupons-list">
          {coupons.map((coupon) => (
            <div key={coupon.id} className={`coupon-card ${coupon.status === 'EXPIRED' ? 'expired' : ''}`}>
              <div className="coupon-amount">
                <span className="coupon-currency">¥</span>
                <span className="coupon-value">{coupon.amount}</span>
              </div>
              <div className="coupon-info">
                <div className="coupon-title">{coupon.title}</div>
                <div className="coupon-condition">满 {coupon.threshold} 可用</div>
                <div className="coupon-expire">有效期至 {coupon.expireAt}</div>
              </div>
              <div className="coupon-status">
                {coupon.status === 'AVAILABLE' && <span className="status-badge available">可使用</span>}
                {coupon.status === 'USED' && <span className="status-badge used">已使用</span>}
                {coupon.status === 'EXPIRED' && <span className="status-badge expired">已过期</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Coupons;
