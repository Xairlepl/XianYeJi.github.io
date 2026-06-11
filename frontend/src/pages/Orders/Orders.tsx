import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ORDER_STATUS_MAP } from '../../data/mockData';
import { mockApi } from '../../services/mockApi';
import type { Order } from '../../types';
import { setProductImageFallback } from '../../utils/imageFallback';
import './Orders.css';

type TabKey = 'ALL' | 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

const Orders = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ PENDING: 0, PAID: 0, SHIPPED: 0, COMPLETED: 0 });
  const [loading, setLoading] = useState(true);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'ALL', label: '全部' },
    { key: 'PENDING', label: '待付款' },
    { key: 'PAID', label: '待发货' },
    { key: 'SHIPPED', label: '待收货' },
    { key: 'COMPLETED', label: '已完成' },
    { key: 'CANCELLED', label: '已取消' },
  ];

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    mockApi.getOrders(activeTab).then((data) => {
      if (!mounted) return;
      setOrders(data.orders);
      setStats(data.stats);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [activeTab]);

  const handleOrderAction = async (orderId: number, action: 'pay' | 'cancel' | 'receive') => {
    setPendingOrderId(orderId);
    const data = await mockApi.updateOrder(orderId, action);
    setStats(data.stats);
    const next = activeTab === 'ALL' ? data.orders : data.orders.filter((order) => order.status === activeTab);
    setOrders(next);
    setPendingOrderId(null);
  };

  return (
    <main className="orders-page container section" id="orders-page">
      <h1 className="page-title">📋 我的订单</h1>

      <div className="orders-summary">
        <div><strong>{stats.PENDING}</strong><span>待付款</span></div>
        <div><strong>{stats.PAID}</strong><span>待发货</span></div>
        <div><strong>{stats.SHIPPED}</strong><span>待收货</span></div>
        <div><strong>{stats.COMPLETED}</strong><span>已完成</span></div>
      </div>

      {/* Tabs */}
      <div className="orders-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`orders-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="page-loading">
          <span className="loading-spinner" />
          <span>正在加载模拟订单...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>暂无相关订单</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>去逛逛</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order, i) => (
            <div key={order.id} className="order-card card" style={{ animationDelay: `${i * 0.08}s` }}>
              {/* Header */}
              <div className="order-card-header">
                <div className="order-header-left">
                  <span className="order-no">订单号：{order.orderNo}</span>
                  <span className="order-time">{order.createdAt}</span>
                </div>
                <span
                  className="order-status-tag"
                  style={{ color: ORDER_STATUS_MAP[order.status]?.color }}
                >
                  {ORDER_STATUS_MAP[order.status]?.label}
                </span>
              </div>

              {/* Items */}
              <div className="order-card-body">
                {order.items.map((item) => (
                  <div key={item.id} className="order-product-row">
                    <Link to={`/product/${item.productId}`} className="order-product-img">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        onError={(event) => setProductImageFallback(event, item.productName)}
                      />
                    </Link>
                    <div className="order-product-info">
                      <Link to={`/product/${item.productId}`} className="order-product-name">
                        {item.productName}
                      </Link>
                    </div>
                    <div className="order-product-price">¥{item.price.toFixed(1)}</div>
                    <div className="order-product-qty">x{item.quantity}</div>
                    <div className="order-product-subtotal">¥{item.subtotal.toFixed(1)}</div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="order-card-footer">
                <div className="order-footer-total">
                  共 {order.items.reduce((s, i) => s + i.quantity, 0)} 件，
                  合计：<span className="order-total-price">¥{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="order-footer-actions">
                  {order.status === 'PENDING' && (
                    <>
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={() => handleOrderAction(order.id, 'pay')}
                        disabled={pendingOrderId !== null}
                      >
                        {pendingOrderId === order.id ? '处理中...' : '去付款'}
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOrderAction(order.id, 'cancel')}
                        disabled={pendingOrderId !== null}
                      >
                        取消订单
                      </button>
                    </>
                  )}
                  {order.status === 'SHIPPED' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleOrderAction(order.id, 'receive')}
                      disabled={pendingOrderId !== null}
                    >
                      {pendingOrderId === order.id ? '确认中...' : '确认收货'}
                    </button>
                  )}
                  {order.status === 'COMPLETED' && (
                    <button className="btn btn-secondary btn-sm">去评价</button>
                  )}
                  <button className="btn btn-secondary btn-sm">查看详情</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Orders;
