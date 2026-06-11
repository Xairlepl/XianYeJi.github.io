import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer-inner container">
        {/* Top section */}
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-icon">🌾</span>
              <span className="logo-name">鲜野集</span>
            </Link>
            <p className="footer-desc">
              连接优质农产地与消费者，精选全国原生态农产品。
              我们坚持产地直发，保障品质，让每一份新鲜直达您的餐桌。
            </p>
            <div className="footer-contact">
              <span>📞 400-668-8866</span>
              <span>📧 hello@freshwild.cn</span>
            </div>
          </div>

          <div className="footer-links-group">
            <div className="footer-links-col">
              <h4>商品分类</h4>
              <Link to="/products?category=1">新鲜水果</Link>
              <Link to="/products?category=2">时令蔬菜</Link>
              <Link to="/products?category=3">粮油米面</Link>
              <Link to="/products?category=4">肉禽蛋品</Link>
            </div>
            <div className="footer-links-col">
              <h4>用户服务</h4>
              <Link to="/profile">个人中心</Link>
              <Link to="/orders">我的订单</Link>
              <Link to="/cart">购物车</Link>
              <Link to="/profile">收货地址</Link>
            </div>
            <div className="footer-links-col">
              <h4>关于我们</h4>
              <a href="#">公司介绍</a>
              <a href="#">加入我们</a>
              <a href="#">商家入驻</a>
              <a href="#">隐私政策</a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© 2026 鲜野集 FreshWild. All rights reserved.</p>
          <div className="footer-badges">
            <span className="trust-badge">🛡️ 品质保障</span>
            <span className="trust-badge">🌱 原生态</span>
            <span className="trust-badge">🚚 产地直发</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
