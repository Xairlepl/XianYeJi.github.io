import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wheat, Sprout, Truck, Wallet, ArrowLeft, ShieldCheck, UserRound, Store } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import './Login.css';

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
    setForm({ ...form, username, password });
  };

  return (
    <main className="login-page" id="login-page">
      <div className="login-container">
        {/* Left visual */}
        <div className="login-visual">
          <div className="login-visual-content">
            <span className="login-visual-icon">
              <Wheat size={56} />
            </span>
            <h2>鲜野集</h2>
            <p>原生态农产品 · 产地直发</p>
            <div className="login-visual-features">
              <div className="visual-feature">
                <span className="visual-feature-icon">
                  <Sprout size={18} />
                </span>
                <span>精选全国原生态农产品</span>
              </div>
              <div className="visual-feature">
                <span className="visual-feature-icon">
                  <Truck size={18} />
                </span>
                <span>产地直发 · 48小时送达</span>
              </div>
              <div className="visual-feature">
                <span className="visual-feature-icon">
                  <Wallet size={18} />
                </span>
                <span>新人注册享专属优惠</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h1>{isLogin ? '欢迎回来' : '创建账号'}</h1>
            <p>{isLogin ? '登录您的鲜野集账号' : '注册成为鲜野集会员'}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">用户名</label>
              <input
                id="username"
                type="text"
                placeholder="请输入用户名"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="phone">手机号</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="请输入手机号"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">密码</label>
              <input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">确认密码</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg login-submit-btn"
              id="login-submit"
              disabled={loading}
            >
              {loading ? '模拟请求中...' : isLogin ? '登 录' : '注 册'}
            </button>
          </form>

          <div className="login-demo">
            <span className="login-demo-title">演示账号一键填充</span>
            <div className="login-demo-list">
              <button type="button" className="login-demo-btn" onClick={() => fillDemo('admin', 'admin123')} disabled={loading}>
                <ShieldCheck size={14} />
                管理员 admin / admin123
              </button>
              <button type="button" className="login-demo-btn" onClick={() => fillDemo('张三', '123456')} disabled={loading}>
                <UserRound size={14} />
                会员 张三 / 123456
              </button>
              <button type="button" className="login-demo-btn" onClick={() => fillDemo('果园王五', '123456')} disabled={loading}>
                <Store size={14} />
                商家 果园王五 / 123456
              </button>
            </div>
          </div>

          <div className="login-switch">
            <span>{isLogin ? '还没有账号？' : '已有账号？'}</span>
            <button
              className="switch-btn"
              onClick={() => {
                setIsLogin(!isLogin);
              }}
              disabled={loading}
            >
              {isLogin ? '立即注册' : '去登录'}
            </button>
          </div>

          <Link to="/" className="back-home">
            <ArrowLeft size={14} />
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Login;
