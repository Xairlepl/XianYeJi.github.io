import { Link } from 'react-router-dom';
import { Phone, Mail, MessageCircle, QrCode, Headset } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer-inner container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo" aria-label="鲜野集首页">
              <span className="footer-mark">鲜</span>
              <span className="footer-name">鲜野集</span>
            </Link>
            <p className="footer-desc">
              连接优质产地和城市餐桌，提供水果蔬菜、米面粮油、肉禽蛋奶与地方特产的直采履约服务。
            </p>
            <div className="footer-contact">
              <a href="tel:4006688866">
                <Phone size={16} />
                400-668-8866
              </a>
              <a href="mailto:hello@freshwild.cn">
                <Mail size={16} />
                hello@freshwild.cn
              </a>
            </div>
            <div className="footer-social">
              <a href="#" aria-label="微信社群" title="微信社群">
                <MessageCircle size={18} />
              </a>
              <a href="#" aria-label="公众号二维码" title="公众号二维码">
                <QrCode size={18} />
              </a>
              <a href="#" aria-label="在线客服" title="在线客服">
                <Headset size={18} />
              </a>
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
              <Link to="/addresses">收货地址</Link>
            </div>
            <div className="footer-links-col">
              <h4>服务承诺</h4>
              <span>产地批次溯源</span>
              <span>冷链控温配送</span>
              <span>坏果快速赔付</span>
              <span>企业团购支持</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 鲜野集 FreshWild. All rights reserved.</p>
          <div className="footer-badges">
            <span>品质严选</span>
            <span>产地直发</span>
            <span>售后保障</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
