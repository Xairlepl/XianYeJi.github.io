import { useEffect, useState } from 'react';
import { Store, CheckCircle2, Ban } from 'lucide-react';
import { mockApi } from '@/services/mockApi';
import { APPLICATION_STATUS_MAP } from '@/data/mockData';
import { useToastStore } from '@/store/toastStore';
import type { SellerApplication } from '@/types';

const AdminApplications = () => {
  const showToast = useToastStore((state) => state.show);
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    mockApi.getSellerApplications().then((list) => {
      if (!mounted) return;
      setApplications(list);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleReview = async (application: SellerApplication, approve: boolean) => {
    let rejectReason: string | undefined;
    if (approve) {
      if (!confirm(`确认通过「${application.shopName}」的入驻申请？通过后该用户将升级为商家。`)) return;
    } else {
      const input = prompt('请输入驳回原因：', '资质材料不完整，请补充后重新提交');
      if (input === null) return;
      rejectReason = input;
    }

    setPendingId(application.id);
    try {
      const list = await mockApi.reviewSellerApplication(application.id, approve, rejectReason);
      setApplications(list);
      showToast(approve ? `已通过「${application.shopName}」的入驻申请` : '申请已驳回', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '操作失败', 'error');
    } finally {
      setPendingId(null);
    }
  };

  const pendingCount = applications.filter((app) => app.status === 'PENDING').length;

  return (
    <div className="admin-applications" id="admin-applications">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            <Store size={22} />
            入驻审核
          </h1>
          <p className="admin-page-desc">
            审核用户提交的商家入驻申请，通过后自动升级为商家角色并开通店铺
            {pendingCount > 0 && `（${pendingCount} 条待处理）`}
          </p>
        </div>
      </div>

      <div className="admin-panel">
        {loading ? (
          <div className="admin-loading">
            <span className="loading-spinner" />
            <span>正在加载申请...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="admin-empty">暂无入驻申请</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>申请人</th>
                  <th>店铺名称</th>
                  <th>主营品类</th>
                  <th>业务介绍</th>
                  <th>联系电话</th>
                  <th>申请时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => {
                  const status = APPLICATION_STATUS_MAP[application.status];
                  const busy = pendingId !== null;
                  return (
                    <tr key={application.id}>
                      <td>{application.username}</td>
                      <td style={{ fontWeight: 700 }}>{application.shopName}</td>
                      <td>{application.mainCategory}</td>
                      <td style={{ maxWidth: 260 }}>
                        <span
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                          title={application.description}
                        >
                          {application.description}
                        </span>
                        {application.status === 'REJECTED' && application.rejectReason && (
                          <small style={{ display: 'block', color: 'var(--color-error)', marginTop: 4 }}>
                            驳回原因：{application.rejectReason}
                          </small>
                        )}
                      </td>
                      <td>{application.contactPhone}</td>
                      <td>{application.createdAt}</td>
                      <td>
                        <span
                          className="status-pill"
                          style={{ background: `${status?.color}1a`, color: status?.color }}
                        >
                          {status?.label}
                        </span>
                      </td>
                      <td>
                        {application.status === 'PENDING' ? (
                          <div className="admin-table-actions">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleReview(application, true)}
                              disabled={busy}
                            >
                              <CheckCircle2 size={14} />
                              {pendingId === application.id ? '...' : '通过'}
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleReview(application, false)}
                              disabled={busy}
                            >
                              <Ban size={14} />
                              驳回
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--text-xs)' }}>
                            {application.reviewedAt ?? '已处理'}
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

export default AdminApplications;
