import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, Truck, Ban, CheckCircle2 } from 'lucide-react';
import { mockApi, type OrderFilter } from '@/services/mockApi';
import { ORDER_STATUS_MAP } from '@/data/mockData';
import { useToastStore } from '@/store/toastStore';
import type { Order } from '@/types';

const tabs: { key: OrderFilter; label: string }[] = [
  { key: 'ALL', label: '全部' },
  { key: 'PENDING', label: '待付款' },
  { key: 'PAID', label: '待发货' },
  { key: 'SHIPPED', label: '待收货' },
  { key: 'COMPLETED', label: '已完成' },
  { key: 'CANCELLED', label: '已取消' },
];

const AdminOrders = () => {
  const showToast = useToastStore((state) => state.show);
  const [activeTab, setActiveTab] = useState<OrderFilter>('ALL');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const loadOrders = useCallback(async (status: OrderFilter) => {
    const data = await mockApi.getAdminOrders(status);
    setOrders(data.orders);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      loadOrders(activeTab);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeTab, loadOrders]);

  const handleAction = async (order: Order, action: 'ship' | 'cancel' | 'complete') => {
    const labels = { ship: '发货', cancel: '取消订单', complete: '标记完成' };
    if (action === 'cancel' && !confirm(`确认取消订单 ${order.orderNo}？`)) return;

    setPendingId(order.id);
    try {
      await mockApi.adminUpdateOrder(order.id, action);
      await loadOrders(activeTab);
      showToast(`订单 ${order.orderNo} 已${labels[action]}`, 'success');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="admin-orders" id="admin-orders">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            <ClipboardList size={22} />
            订单管理
          </h1>
          <p className="admin-page-desc">已支付订单可执行发货，配送中的订单可标记完成</p>
        </div>
      </div>

      <div className="admin-filter-bar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`btn btn-sm ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
        <span className="admin-filter-count">共 {orders.length} 笔订单</span>
      </div>

      <div className="admin-panel">
        {loading ? (
          <div className="admin-loading">
            <span className="loading-spinner" />
            <span>正在加载订单...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-empty">暂无相关订单</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>商品明细</th>
                  <th>收货人</th>
                  <th>金额</th>
                  <th>状态</th>
                  <th>下单时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const status = ORDER_STATUS_MAP[order.status];
                  const first = order.items[0];
                  const busy = pendingId !== null;
                  return (
                    <tr key={order.id}>
                      <td>{order.orderNo}</td>
                      <td>
                        {first?.productName}
                        {order.items.length > 1 && ` 等 ${order.items.length} 件`}
                      </td>
                      <td>{order.address.receiver}</td>
                      <td>¥{order.totalAmount.toFixed(2)}</td>
                      <td>
                        <span
                          className="status-pill"
                          style={{ background: `${status?.color}1a`, color: status?.color }}
                        >
                          {status?.label}
                        </span>
                      </td>
                      <td>{order.createdAt}</td>
                      <td>
                        <div className="admin-table-actions">
                          {order.status === 'PAID' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAction(order, 'ship')}
                              disabled={busy}
                            >
                              <Truck size={14} />
                              {pendingId === order.id ? '...' : '发货'}
                            </button>
                          )}
                          {order.status === 'SHIPPED' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAction(order, 'complete')}
                              disabled={busy}
                            >
                              <CheckCircle2 size={14} />
                              标记完成
                            </button>
                          )}
                          {order.status === 'PENDING' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleAction(order, 'cancel')}
                              disabled={busy}
                            >
                              <Ban size={14} />
                              取消订单
                            </button>
                          )}
                          {['COMPLETED', 'CANCELLED', 'RECEIVED'].includes(order.status) && (
                            <span style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--text-xs)' }}>
                              无可用操作
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
