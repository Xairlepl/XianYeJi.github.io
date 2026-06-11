import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
      if (isLogin) {
        await login(form.username, form.password);
        showToast('登录成功', 'success');
      } else {
        await register(form.username, form.password, form.phone);
        showToast('注册成功', 'success');
      }
      window.setTimeout(() => navigate('/profile'), 400);
    } catch (error) {
      showToast(error instanceof Error ? error.message : '提交失败', 'error');
      setLoading(false);
    }
  };

  return (
    <main className="login-page" id="login-page">
      <div className="login-container">
        {/* Left visual */}
        <div className="login-visual">
          <div className="login-visual-content">
            <span className="login-visual-icon">🌾</span>
            <h2>龙野农品</h2>
            <p>新鲜直达 · 品质保障</p>
            <div className="login-visual-features">
              <div className="visual-feature">
                <span>🍎</span>
                <span>精选全国优质农产品</span>
              </div>
              <div className="visual-feature">
                <span>🚚</span>
                <span>产地直发 · 48小时送达</span>
              </div>
              <div className="visual-feature">
                <span>💰</span>
                <span>新人注册享受专属优惠</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h1>{isLogin ? '欢迎回来' : '创建账号'}</h1>
            <p>{isLogin ? '登录您的龙野农品账号' : '注册成为龙野农品会员'}</p>
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

          <Link to="/" className="back-home">← 返回首页</Link>
        </div>
      </div>
    </main>
  );
};

export default Login;
