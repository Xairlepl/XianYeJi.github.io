import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = useCartStore((state) => state.count);
  const { user, isAuthenticated } = useAuthStore();
  const refreshCart = useCartStore((state) => state.refreshCount);

  const navLinks = [
    { path: '/', label: '首页' },
    { path: '/products', label: '全部商品' },
    { path: '/products?category=1', label: '新鲜水果' },
    { path: '/products?category=2', label: '时令蔬菜' },
  ];

  useEffect(() => {
    refreshCart();
  }, [location.pathname, refreshCart]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const keyword = searchValue.trim();
    navigate(keyword ? `/products?keyword=${encodeURIComponent(keyword)}` : '/products');
  };

  return (
    <header className="header glass" id="main-header">
      <div className="header-inner container">
        {/* Logo */}
        <Link to="/" className="header-logo" id="logo-link">
          <span className="logo-icon">🌾</span>
          <div className="logo-text">
            <span className="logo-name">鲜野集</span>
            <span className="logo-slogan">原生态 · 产地直发</span>
          </div>
        </Link>

        {/* Search */}
        <form className="header-search" id="header-search" onSubmit={handleSearch}>
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="搜索农产品，如：苹果、大米、龙井茶..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="search-input"
            id="search-input"
          />
          <button className="search-btn btn btn-primary btn-sm" id="search-btn">
            搜索
          </button>
        </form>

        {/* Nav */}
        <nav className={`header-nav ${mobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="header-actions">
          <Link to="/cart" className="action-btn" id="cart-btn" title="购物车">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          <Link to="/profile" className="action-btn" id="profile-btn" title="个人中心">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
          {isAuthenticated && user ? (
            <span className="header-username" title={user.username}>
              {user.username}
            </span>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm header-login-btn" id="login-btn">
              登录
            </Link>
          )}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="菜单"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
