import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockApi } from '../../services/mockApi';
import type { CartItem } from '../../types';
import { setProductImageFallback } from '../../utils/imageFallback';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    mockApi.getCart().then((cartItems) => {
      if (!mounted) return;
      setItems(cartItems);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const toggleCheck = async (id: number) => {
    const current = items.find((item) => item.id === id);
    if (!current) return;
    setPendingId(id);
    setItems(await mockApi.toggleCartItem(id, !current.checked));
    setPendingId(null);
  };

  const toggleAll = async () => {
    const allChecked = items.every((item) => item.checked);
    setPendingId(-1);
    setItems(await mockApi.toggleAllCartItems(!allChecked));
    setPendingId(null);
  };

  const updateQuantity = async (id: number, delta: number) => {
    const current = items.find((item) => item.id === id);
    if (!current) return;
    setPendingId(id);
    setItems(await mockApi.updateCartItem(id, current.quantity + delta));
    setPendingId(null);
  };

  const removeItem = async (id: number) => {
    setPendingId(id);
    setItems(await mockApi.removeCartItem(id));
    setPendingId(null);
    setMessage('已从购物车删除商品');
  };

  const checkout = async () => {
    setCheckoutLoading(true);
    setMessage('');

    try {
      await mockApi.checkoutCart(checkedItems.map((item) => item.id));
      navigate('/orders');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '结算失败');
      setCheckoutLoading(false);
    }
  };

  const checkedItems = items.filter((item) => item.checked);
  const totalPrice = checkedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const allChecked = items.length > 0 && items.every((item) => item.checked);

  return (
    <main className="cart-page container section" id="cart-page">
      <h1 className="page-title">🛒 我的购物车</h1>

      {loading ? (
        <div className="page-loading">
          <span className="loading-spinner" />
          <span>正在加载模拟购物车...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🛒</span>
          <p>购物车空空如也</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            去逛逛
          </Link>
        </div>
      ) : (
        <>
          {message && <div className="cart-message">{message}</div>}
          {/* Cart Header */}
          <div className="cart-header glass">
            <label className="cart-check-all">
              <input type="checkbox" checked={allChecked} onChange={toggleAll} disabled={pendingId !== null} />
              <span>全选</span>
            </label>
            <span className="cart-col-info">商品信息</span>
            <span className="cart-col-price">单价</span>
            <span className="cart-col-qty">数量</span>
            <span className="cart-col-subtotal">小计</span>
            <span className="cart-col-action">操作</span>
          </div>

          {/* Cart Items */}
          <div className="cart-items">
            {items.map((item, i) => (
              <div
                key={item.id}
                className="cart-item card"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <label className="cart-item-check">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleCheck(item.id)}
                    disabled={pendingId !== null}
                  />
                </label>
                <Link to={`/product/${item.product.id}`} className="cart-item-image">
                  <img
                    src={item.product.coverImage}
                    alt={item.product.name}
                    onError={(event) => setProductImageFallback(event, item.product.name)}
                  />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/product/${item.product.id}`} className="cart-item-name">
                    {item.product.name}
                  </Link>
                  <span className="cart-item-origin">📍 {item.product.origin}</span>
                </div>
                <div className="cart-item-price">
                  <span className="price-symbol">¥</span>
                  {item.product.price.toFixed(1)}
                </div>
                <div className="cart-item-qty">
                  <div className="quantity-control">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={item.quantity <= 1 || pendingId !== null}
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, 1)}
                      disabled={pendingId !== null || item.quantity >= item.product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-item-subtotal">
                  ¥{(item.product.price * item.quantity).toFixed(1)}
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => removeItem(item.id)}
                  title="删除"
                  disabled={pendingId !== null}
                >
                  {pendingId === item.id ? '...' : '🗑️'}
                </button>
              </div>
            ))}
          </div>

          {/* Cart Footer */}
          <div className="cart-footer glass">
            <div className="cart-footer-left">
              <label className="cart-check-all">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} disabled={pendingId !== null} />
                <span>全选</span>
              </label>
              <span className="cart-selected">
                已选 <strong>{checkedItems.length}</strong> 件
              </span>
            </div>
            <div className="cart-footer-right">
              <div className="cart-total">
                合计：
                <span className="cart-total-price">¥{totalPrice.toFixed(2)}</span>
              </div>
              <button
                className="btn btn-accent btn-lg"
                id="checkout-btn"
                disabled={checkedItems.length === 0 || checkoutLoading}
                onClick={checkout}
              >
                {checkoutLoading ? '生成订单中...' : `去结算 (${checkedItems.length})`}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default Cart;
