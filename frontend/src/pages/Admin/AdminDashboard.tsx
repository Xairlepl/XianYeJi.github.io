import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  CircleDollarSign,
  ClipboardList,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  PackageX,
} from 'lucide-react';
import { mockApi } from '@/services/mockApi';
import { ORDER_STATUS_MAP } from '@/data/mockData';
import { setProductImageFallback } from '@/utils/imageFallback';

type AdminStats = Awaited<ReturnType<typeof mockApi.getAdminStats>>;

const AdminDashboard = () => {
  const [data, setData] = useState<AdminStats | null>(null);

  useEffect(() => {
    let mounted = true;
    mockApi.getAdminStats().then((stats) => {
      if (mounted) setData(stats);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!data) {
    return (
      <div className="admin-loading">
        <span className="loading-spinner" />
        <span>正在加载运营数据...</span>
      </div>
    );
  }

  const statCards = [
    {
      label: '总销售额（不含已取消）',
      value: `¥${data.totalSales.toLocaleString('zh-CN')}`,
      Icon: CircleDollarSign,
      tone: '',
    },
    { label: '订单总数', value: String(data.orderCount), Icon: ClipboardList, tone: 'info' },
    { label: '注册用户', value: String(data.userCount), Icon: Users, tone: 'accent' },
    { label: '库存预警商品', value: String(data.lowStockCount), Icon: AlertTriangle, tone: 'warn' },
  ];

  const orderStatusItems = [
    { label: '待付款', value: data.orderStats.PENDING },
    { label: '待发货', value: data.orderStats.PAID },
    { label: '待收货', value: data.orderStats.SHIPPED },
    { label: '已完成', value: data.orderStats.COMPLETED },
    { label: '已取消', value: data.cancelledCount },
  ];

  return (
    <div className="admin-dashboard" id="admin-dashboard">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            <LayoutDashboard size={22} />
            数据看板
          </h1>
          <p className="admin-page-desc">平台经营概况一览，数据来自模拟接口</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        {statCards.map(({ label, value, Icon, tone }) => (
          <div key={label} className="admin-stat-card">
            <span className={`admin-stat-icon ${tone}`}>
              <Icon size={24} />
            </span>
            <span className="admin-stat-info">
              <span className="admin-stat-value">{value}</span>
              <span className="admin-stat-label">{label}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">
            <ClipboardList size={18} />
            订单状态分布
          </h2>
        </div>
        <div className="admin-order-status-row">
          {orderStatusItems.map((item) => (
            <div key={item.label} className="admin-order-status-item">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-panel" style={{ marginBottom: 0 }}>
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">
              <Clock size={18} />
              最新订单
            </h2>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>商品</th>
                  <th>金额</th>
                  <th>状态</th>
                  <th>下单时间</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => {
                  const status = ORDER_STATUS_MAP[order.status];
                  const first = order.items[0];
                  return (
                    <tr key={order.id}>
                      <td>{order.orderNo}</td>
                      <td>
                        {first?.productName}
                        {order.items.length > 1 && ` 等 ${order.items.length} 件`}
                      </td>
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="admin-panel" style={{ marginBottom: 0 }}>
            <div className="admin-panel-header">
              <h2 className="admin-panel-title">
                <TrendingUp size={18} />
                热销商品 TOP5
              </h2>
            </div>
            <div className="admin-rank-list">
              {data.topProducts.map((product, index) => (
                <div key={product.id} className="admin-rank-item">
                  <span className="admin-rank-no">{index + 1}</span>
                  <img
                    src={product.coverImage}
                    alt={product.name}
                    width={36}
                    height={36}
                    style={{ borderRadius: 8, objectFit: 'cover' }}
                    onError={(event) => setProductImageFallback(event, product.name)}
                  />
                  <span className="admin-rank-info">
                    <span className="name">{product.name}</span>
                    <small>¥{product.price.toFixed(1)}/{product.unit}</small>
                  </span>
                  <span className="admin-rank-value">已售 {product.sales}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-panel" style={{ marginBottom: 0 }}>
            <div className="admin-panel-header">
              <h2 className="admin-panel-title">
                <PackageX size={18} />
                库存预警
              </h2>
            </div>
            {data.lowStockProducts.length > 0 ? (
              <div className="admin-rank-list">
                {data.lowStockProducts.map((product) => (
                  <div key={product.id} className="admin-rank-item">
                    <span className="admin-rank-info">
                      <span className="name">{product.name}</span>
                      <small>{product.origin}</small>
                    </span>
                    <span
                      className="status-pill"
                      style={
                        product.stock === 0
                          ? { background: '#c83f321a', color: 'var(--color-error)' }
                          : { background: '#d98a161a', color: 'var(--color-warning)' }
                      }
                    >
                      {product.stock === 0 ? '已售罄' : `余 ${product.stock}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="admin-empty">库存状态良好</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
