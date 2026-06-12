import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, MapPin, Trash2, Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useToastStore } from '@/store/toastStore';
import { mockApi } from '@/services/mockApi';
import { setProductImageFallback } from '@/utils/imageFallback';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { items, init, updateQuantity, toggleCheck, toggleAll, removeItem } = useCartStore();
  const showToast = useToastStore((state) => state.show);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    init().then(() => setLoading(false));
  }, [init]);

  const handleToggleCheck = async (id: number) => {
    const current = items.find((item) => item.id === id);
    if (!current) return;
    setPendingId(id);
    await toggleCheck(id, !current.checked);
    setPendingId(null);
  };

  const handleToggleAll = async () => {
    const allChecked = items.every((item) => item.checked);
    setPendingId(-1);
    await toggleAll(!allChecked);
    setPendingId(null);
  };

  const handleUpdateQuantity = async (id: number, delta: number) => {
    const current = items.find((item) => item.id === id);
    if (!current) return;
    setPendingId(id);
    await updateQuantity(id, current.quantity + delta);
    setPendingId(null);
  };

  const handleRemoveItem = async (id: number) => {
    setPendingId(id);
    await removeItem(id);
    setPendingId(null);
    showToast('已从购物车删除商品', 'success');
  };

  const checkout = async () => {
    setCheckoutLoading(true);

    try {
      await mockApi.checkoutCart(checkedItems.map((item) => item.id));
      showToast('订单创建成功', 'success');
      navigate('/orders');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '结算失败', 'error');
      setCheckoutLoading(false);
    }
  };

  const checkedItems = items.filter((item) => item.checked);
  const totalPrice = checkedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const allChecked = items.length > 0 && items.every((item) => item.checked);

  return (
    <main className="cart-page container section" id="cart-page">
      <h1 className="page-title">
        <ShoppingCart size={26} />
        我的购物车
      </h1>

      {loading ? (
        <div className="page-loading">
          <span className="loading-spinner" />
          <span>正在加载模拟购物车...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">
            <ShoppingCart size={40} />
          </span>
          <p>购物车还是空的</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            去逛逛
          </Link>
        </div>
      ) : (
        <>
          {/* Cart Header */}
          <div className="cart-header glass">
            <label className="cart-check-all">
              <input type="checkbox" checked={allChecked} onChange={() => handleToggleAll()} disabled={pendingId !== null} />
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
                    onChange={() => handleToggleCheck(item.id)}
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
                  <span className="cart-item-origin">
                    <MapPin size={13} />
                    {item.product.origin}
                  </span>
                </div>
                <div className="cart-item-price">
                  <span className="price-symbol">¥</span>
                  {item.product.price.toFixed(1)}
                </div>
                <div className="cart-item-qty">
                  <div className="quantity-control">
                    <button
                      className="qty-btn"
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      disabled={item.quantity <= 1 || pendingId !== null}
                      aria-label="减少数量"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      disabled={pendingId !== null || item.quantity >= item.product.stock}
                      aria-label="增加数量"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="cart-item-subtotal">
                  ¥{(item.product.price * item.quantity).toFixed(1)}
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => handleRemoveItem(item.id)}
                  title="删除"
                  aria-label="删除商品"
                  disabled={pendingId !== null}
                >
                  {pendingId === item.id ? '...' : <Trash2 size={18} />}
                </button>
              </div>
            ))}
          </div>

          {/* Cart Footer */}
          <div className="cart-footer glass">
            <div className="cart-footer-left">
              <label className="cart-check-all">
                <input type="checkbox" checked={allChecked} onChange={handleToggleAll} disabled={pendingId !== null} />
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
