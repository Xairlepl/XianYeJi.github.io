import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  CircleDollarSign,
  ClipboardList,
  Package,
  Truck,
  TrendingUp,
  Clock,
  PackageX,
} from 'lucide-react';
import { mockApi } from '@/services/mockApi';
import { ORDER_STATUS_MAP } from '@/data/mockData';
import { setProductImageFallback } from '@/utils/imageFallback';

type SellerStats = Awaited<ReturnType<typeof mockApi.getSellerStats>>;

const SellerDashboard = () => {
  const [data, setData] = useState<SellerStats | null>(null);

  useEffect(() => {
    let mounted = true;
    mockApi.getSellerStats().then((stats) => {
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
        <span>正在加载店铺数据...</span>
      </div>
    );
  }

  const statCards = [
    {
      label: '店铺流水（不含已取消）',
      value: `¥${data.revenue.toLocaleString('zh-CN')}`,
      Icon: CircleDollarSign,
      tone: '',
    },
    { label: '店铺订单', value: String(data.orderCount), Icon: ClipboardList, tone: 'info' },
    { label: '待发货订单', value: String(data.pendingShipCount), Icon: Truck, tone: 'warn' },
    { label: '在售商品', value: String(data.productCount), Icon: Package, tone: 'fresh' },
  ];

  return (
    <div className="seller-dashboard" id="seller-dashboard">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            <LayoutDashboard size={22} />
            经营工作台
          </h1>
          <p className="admin-page-desc">「{data.shopName}」经营概况，仅统计本店铺数据</p>
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

      <div className="admin-dashboard-grid">
        <div className="admin-panel" style={{ marginBottom: 0 }}>
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">
              <Clock size={18} />
              最新店铺订单
            </h2>
          </div>
          {data.recentOrders.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>订单号</th>
                    <th>商品</th>
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
          ) : (
            <div className="admin-empty">店铺暂无订单</div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="admin-panel" style={{ marginBottom: 0 }}>
            <div className="admin-panel-header">
              <h2 className="admin-panel-title">
                <TrendingUp size={18} />
                本店热销
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

export default SellerDashboard;
