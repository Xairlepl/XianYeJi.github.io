import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, Truck } from 'lucide-react';
import { mockApi, type OrderFilter } from '@/services/mockApi';
import { ORDER_STATUS_MAP } from '@/data/mockData';
import { useToastStore } from '@/store/toastStore';
import type { Order } from '@/types';

type SellerOrder = Order & { sellerSubtotal: number };

const tabs: { key: OrderFilter; label: string }[] = [
  { key: 'ALL', label: '全部' },
  { key: 'PENDING', label: '待付款' },
  { key: 'PAID', label: '待发货' },
  { key: 'SHIPPED', label: '待收货' },
  { key: 'COMPLETED', label: '已完成' },
  { key: 'CANCELLED', label: '已取消' },
];

const SellerOrders = () => {
  const showToast = useToastStore((state) => state.show);
  const [activeTab, setActiveTab] = useState<OrderFilter>('ALL');
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const loadOrders = useCallback(async (status: OrderFilter) => {
    const data = await mockApi.getSellerOrders(status);
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

  const handleShip = async (order: SellerOrder) => {
    setPendingId(order.id);
    try {
      await mockApi.sellerShipOrder(order.id);
      await loadOrders(activeTab);
      showToast(`订单 ${order.orderNo} 已发货`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '发货失败', 'error');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="seller-orders" id="seller-orders">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            <ClipboardList size={22} />
            店铺订单
          </h1>
          <p className="admin-page-desc">仅展示包含本店商品的订单，金额为本店商品小计</p>
        </div>
      </div>

      <div className="admin-filter-bar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`btn btn-sm ${activeTab === tab.key ? 'btn-accent' : 'btn-secondary'}`}
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
                  <th>本店商品</th>
                  <th>收货人</th>
                  <th>本店金额</th>
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
                      <td>¥{order.sellerSubtotal.toFixed(2)}</td>
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
                        {order.status === 'PAID' ? (
                          <button
                            className="btn btn-accent btn-sm"
                            onClick={() => handleShip(order)}
                            disabled={busy}
                          >
                            <Truck size={14} />
                            {pendingId === order.id ? '...' : '发货'}
                          </button>
                        ) : (
                          <span style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--text-xs)' }}>
                            无可用操作
                          </span>
                        )}
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

export default SellerOrders;
