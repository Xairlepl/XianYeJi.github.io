import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Send, Clock, CheckCircle2, XCircle, ShoppingBasket } from 'lucide-react';
import { mockApi } from '@/services/mockApi';
import { mockCategories } from '@/data/mockData';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import type { SellerApplication } from '@/types';
import './SellerApply.css';

const emptyForm = {
  shopName: '',
  contactPhone: '',
  mainCategory: '新鲜水果',
  description: '',
};

const SellerApply = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const showToast = useToastStore((state) => state.show);
  const [application, setApplication] = useState<SellerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [showResubmit, setShowResubmit] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    let mounted = true;
    mockApi.getMyApplication().then((app) => {
      if (!mounted) return;
      setApplication(app);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const app = await mockApi.submitSellerApplication(form);
      setApplication(app);
      setShowResubmit(false);
      showToast('入驻申请已提交，请等待平台审核', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '提交失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated || !user) return null;

  if (loading) {
    return (
      <main className="apply-page container section">
        <div className="page-loading">
          <span className="loading-spinner" />
          <span>加载中...</span>
        </div>
      </main>
    );
  }

  // 已是商家
  if (user.role === 'SELLER') {
    return (
      <main className="apply-page container section">
        <div className="apply-status-card">
          <span className="apply-status-icon success">
            <ShoppingBasket size={36} />
          </span>
          <h1>您已是入驻商家</h1>
          <p>店铺「{user.shopName ?? '我的店铺'}」运营中，前往商家中心管理商品与订单。</p>
          <Link to="/seller" className="btn btn-accent btn-lg">
            进入商家中心
          </Link>
        </div>
      </main>
    );
  }

  if (user.role === 'ADMIN') {
    return (
      <main className="apply-page container section">
        <div className="apply-status-card">
          <span className="apply-status-icon">
            <Store size={36} />
          </span>
          <h1>管理员账号无需入驻</h1>
          <p>入驻申请审核请前往管理后台的「入驻审核」页面。</p>
          <Link to="/admin/applications" className="btn btn-primary btn-lg">
            前往入驻审核
          </Link>
        </div>
      </main>
    );
  }

  // 审核状态展示
  if (application && !showResubmit) {
    if (application.status === 'PENDING') {
      return (
        <main className="apply-page container section">
          <div className="apply-status-card">
            <span className="apply-status-icon pending">
              <Clock size={36} />
            </span>
            <h1>申请审核中</h1>
            <p>
              店铺「{application.shopName}」的入驻申请已于 {application.createdAt} 提交，
              平台会在 1-3 个工作日内完成审核。
            </p>
            <Link to="/profile" className="btn btn-secondary btn-lg">
              返回个人中心
            </Link>
          </div>
        </main>
      );
    }

    if (application.status === 'APPROVED') {
      return (
        <main className="apply-page container section">
          <div className="apply-status-card">
            <span className="apply-status-icon success">
              <CheckCircle2 size={36} />
            </span>
            <h1>恭喜，入驻审核已通过！</h1>
            <p>店铺「{application.shopName}」已开通。请重新登录以激活商家身份，即可进入商家中心。</p>
            <button
              className="btn btn-accent btn-lg"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              重新登录
            </button>
          </div>
        </main>
      );
    }

    return (
      <main className="apply-page container section">
        <div className="apply-status-card">
          <span className="apply-status-icon error">
            <XCircle size={36} />
          </span>
          <h1>申请未通过</h1>
          <p>驳回原因：{application.rejectReason ?? '未通过平台审核'}</p>
          <button className="btn btn-primary btn-lg" onClick={() => setShowResubmit(true)}>
            重新提交申请
          </button>
        </div>
      </main>
    );
  }

  // 申请表单
  return (
    <main className="apply-page container section">
      <div className="apply-layout">
        <aside className="apply-intro">
          <span className="apply-intro-icon">
            <Store size={32} />
          </span>
          <h1>商家入驻</h1>
          <p>把您的优质农产品带给全国的餐桌。提交申请后，平台将在 1-3 个工作日内完成审核。</p>
          <ul>
            <li>0 保证金入驻，先经营后结算</li>
            <li>平台冷链与物流体系全程支持</li>
            <li>专属流量扶持，新店上线即推荐</li>
          </ul>
        </aside>

        <form className="apply-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="apply-shop">店铺名称 *</label>
            <input
              id="apply-shop"
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              placeholder="如：山里红家庭农场"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="apply-phone">联系电话 *</label>
            <input
              id="apply-phone"
              type="tel"
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              placeholder="11 位手机号"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="apply-category">主营品类 *</label>
            <select
              id="apply-category"
              value={form.mainCategory}
              onChange={(e) => setForm({ ...form, mainCategory: e.target.value })}
            >
              {mockCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="apply-desc">业务介绍 *</label>
            <textarea
              id="apply-desc"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="请介绍主营产品、货源情况、经营经验等"
              required
            />
          </div>
          <button type="submit" className="btn btn-accent btn-lg apply-submit" disabled={submitting}>
            <Send size={16} />
            {submitting ? '提交中...' : '提交入驻申请'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default SellerApply;
