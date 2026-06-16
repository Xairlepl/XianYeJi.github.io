import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, Sparkles, ShieldCheck, Store } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import './Header.css';

const navLinks = [
  { path: '/', label: '首页' },
  { path: '/products', label: '全部商品' },
  { path: '/products?category=1', label: '应季鲜果' },
  { path: '/products?category=2', label: '时令蔬菜' },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const cartCount = useCartStore((state) => state.count);
  const refreshCart = useCartStore((state) => state.refreshCount);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    refreshCart();
  }, [location.pathname, refreshCart]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      } else {
        setScrollProgress(0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActiveLink = (path: string) => {
    const [pathname, query] = path.split('?');
    if (location.pathname !== pathname) return false;
    if (!query) return location.search === '' || pathname !== '/products';

    const expected = new URLSearchParams(query);
    const current = new URLSearchParams(location.search);
    return Array.from(expected.entries()).every(([key, value]) => current.get(key) === value);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const keyword = searchValue.trim();
    navigate(keyword ? `/products?keyword=${encodeURIComponent(keyword)}` : '/products');
  };

  return (
    <header className="header" id="main-header">
      <div className="header-inner container">
        <Link to="/" className="header-logo" id="logo-link" aria-label="鲜野集首页">
          <span className="logo-mark">鲜</span>
          <span className="logo-copy">
            <span className="logo-name">鲜野集</span>
            <span className="logo-slogan">产地直发 · 当季严选</span>
          </span>
        </Link>

        <nav className={`header-nav ${mobileMenuOpen ? 'open' : ''}`} aria-label="主导航">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActiveLink(link.path) ? 'active' : ''}`}
              aria-current={isActiveLink(link.path) ? 'page' : undefined}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {/* Mobile-only portal links */}
          {isAuthenticated && user?.role === 'ADMIN' && (
            <Link to="/admin" className="nav-link mobile-only-link" onClick={() => setMobileMenuOpen(false)}>
              <ShieldCheck size={16} />
              管理后台
            </Link>
          )}
          {isAuthenticated && user?.role === 'SELLER' && (
            <Link to="/seller" className="nav-link mobile-only-link" onClick={() => setMobileMenuOpen(false)}>
              <Store size={16} />
              商家中心
            </Link>
          )}
          {isAuthenticated && user ? (
            <div className="nav-user-mobile mobile-only-link">
              <User size={16} />
              <span>账号: {user.username}</span>
            </div>
          ) : (
            <Link to="/login" className="nav-link mobile-only-link login-highlight" onClick={() => setMobileMenuOpen(false)}>
              登录账号
            </Link>
          )}
        </nav>

        <form className="header-search" id="header-search" onSubmit={handleSearch}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="搜索苹果、大米、龙井茶..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="search-input"
            id="search-input"
          />
          <button className="search-btn btn btn-primary btn-sm" id="search-btn" type="submit">
            <Sparkles size={14} />
            搜索
          </button>
        </form>

        <div className="header-actions">
          <Link to="/cart" className="action-btn" id="cart-btn" title="购物车" aria-label="购物车">
            <ShoppingCart size={21} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          <Link to="/profile" className="action-btn" id="profile-btn" title="个人中心" aria-label="个人中心">
            <User size={21} />
          </Link>

          {isAuthenticated && user?.role === 'ADMIN' && (
            <Link to="/admin" className="btn btn-secondary btn-sm header-admin-btn" id="admin-btn">
              <ShieldCheck size={14} />
              管理后台
            </Link>
          )}

          {isAuthenticated && user?.role === 'SELLER' && (
            <Link to="/seller" className="btn btn-secondary btn-sm header-admin-btn" id="seller-btn">
              <Store size={14} />
              商家中心
            </Link>
          )}

          {isAuthenticated && user ? (
            <span className="header-username" title={user.username}>
              {user.username}
            </span>
          ) : (
            <Link to="/login" className="btn btn-secondary btn-sm header-login-btn" id="login-btn">
              登录
            </Link>
          )}

          <button
            className="mobile-menu-btn"
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="打开导航菜单"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* 移动端搜索栏（仅小屏显示） */}
      <form className="header-search-mobile" onSubmit={handleSearch}>
        <Search size={17} className="search-icon" />
        <input
          type="text"
          placeholder="搜索苹果、大米、龙井茶..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          aria-label="搜索商品"
        />
        <button className="btn btn-primary btn-sm" type="submit">
          搜索
        </button>
      </form>

      {/* 页面滚动进度条 */}
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
    </header>
  );
};

export default Header;
