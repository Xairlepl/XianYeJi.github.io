import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  LockKeyhole,
  Phone,
  ShieldCheck,
  Sprout,
  Store,
  Truck,
  UserRound,
  Wallet,
  Wheat,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import './Login.css';

const demoAccounts = [
  {
    label: '管理员',
    username: 'admin',
    password: 'admin123',
    Icon: ShieldCheck,
  },
  {
    label: '会员',
    username: '张三',
    password: '123456',
    Icon: UserRound,
  },
  {
    label: '商家',
    username: '果园王五',
    password: '123456',
    Icon: Store,
  },
];

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuthStore();
  const showToast = useToastStore((state) => state.show);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && form.password !== form.confirmPassword) {
      showToast('两次输入的密码不一致', 'error');
      return;
    }

    setLoading(true);

    try {
      const user = isLogin
        ? await login(form.username, form.password)
        : await register(form.username, form.password, form.phone);
      showToast(isLogin ? '登录成功' : '注册成功', 'success');
      const target = user.role === 'ADMIN' ? '/admin' : user.role === 'SELLER' ? '/seller' : '/profile';
      window.setTimeout(() => navigate(target), 400);
    } catch (error) {
      showToast(error instanceof Error ? error.message : '提交失败', 'error');
      setLoading(false);
    }
  };

  const fillDemo = (username: string, password: string) => {
    setIsLogin(true);
    setForm((current) => ({ ...current, username, password }));
  };

  return (
    <main className="login-page" id="login-page">
      <div className="login-shell">
        <section className="login-visual" aria-label="鲜野集">
          <div className="login-visual-overlay" />
          <div className="login-brand">
            <span className="login-brand-mark">
              <Wheat size={34} />
            </span>
            <div>
              <strong>鲜野集</strong>
              <span>产地直发 · 当季严选</span>
            </div>
          </div>

          <div className="login-visual-content">
            <span className="login-kicker">Fresh Origin Market</span>
            <h1>把产地的新鲜，带回你的餐桌</h1>
            <p>精选合作基地农产品，统一分级、冷链履约、批次可追溯。</p>
          </div>

          <div className="login-feature-grid">
            <div className="visual-feature">
              <Sprout size={18} />
              <span>产地直采</span>
            </div>
            <div className="visual-feature">
              <Truck size={18} />
              <span>冷链配送</span>
            </div>
            <div className="visual-feature">
              <BadgeCheck size={18} />
              <span>批次溯源</span>
            </div>
            <div className="visual-feature">
              <Wallet size={18} />
              <span>会员优惠</span>
            </div>
          </div>
        </section>

        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-panel-top">
            <Link to="/" className="back-home">
              <ArrowLeft size={16} />
              返回首页
            </Link>
          </div>

          <div className="login-form-header">
            <span className="login-form-eyebrow">{isLogin ? 'Welcome back' : 'Create account'}</span>
            <h2 id="login-title">{isLogin ? '欢迎回来' : '创建鲜野集账号'}</h2>
            <p>{isLogin ? '登录后查看订单、优惠券和收藏清单。' : '注册后即可领取新人权益并开始选购。'}</p>
          </div>

          <div className="login-mode-switch" role="tablist" aria-label="账号操作">
            <button
              type="button"
              className={isLogin ? 'active' : ''}
              onClick={() => setIsLogin(true)}
              disabled={loading}
              role="tab"
              aria-selected={isLogin}
            >
              登录
            </button>
            <button
              type="button"
              className={!isLogin ? 'active' : ''}
              onClick={() => setIsLogin(false)}
              disabled={loading}
              role="tab"
              aria-selected={!isLogin}
            >
              注册
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="form-field" htmlFor="username">
              <span>用户名</span>
              <div className="input-shell">
                <UserRound size={18} />
                <input
                  id="username"
                  type="text"
                  placeholder="请输入用户名"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
            </label>

            {!isLogin && (
              <label className="form-field" htmlFor="phone">
                <span>手机号</span>
                <div className="input-shell">
                  <Phone size={18} />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="请输入 11 位手机号"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
              </label>
            )}

            <label className="form-field" htmlFor="password">
              <span>密码</span>
              <div className="input-shell">
                <LockKeyhole size={18} />
                <input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </label>

            {!isLogin && (
              <label className="form-field" htmlFor="confirmPassword">
                <span>确认密码</span>
                <div className="input-shell">
                  <LockKeyhole size={18} />
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="请再次输入密码"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </label>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg login-submit-btn"
              id="login-submit"
              disabled={loading}
            >
              {loading ? '正在提交...' : isLogin ? '登录账号' : '注册账号'}
            </button>
          </form>

          {isLogin && (
            <div className="login-demo" aria-label="演示账号">
              <div className="login-demo-head">
                <span>演示账号</span>
                <small>一键填入</small>
              </div>
              <div className="login-demo-list">
                {demoAccounts.map(({ label, username, password, Icon }) => (
                  <button
                    type="button"
                    className="login-demo-btn"
                    onClick={() => fillDemo(username, password)}
                    disabled={loading}
                    key={label}
                  >
                    <Icon size={15} />
                    <span>{label}</span>
                    <strong>{username}</strong>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Login;
