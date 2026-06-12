import { useCallback, useEffect, useState } from 'react';
import { Users, Search, UserCheck, UserX } from 'lucide-react';
import { mockApi } from '@/services/mockApi';
import { USER_ROLE_MAP } from '@/data/mockData';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import type { User } from '@/types';

const AdminUsers = () => {
  const showToast = useToastStore((state) => state.show);
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const loadUsers = useCallback(async () => {
    const list = await mockApi.getAdminUsers(keyword);
    setUsers(list);
    setLoading(false);
  }, [keyword]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      loadUsers();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  const handleToggleStatus = async (user: User) => {
    const action = user.status === 'DISABLED' ? '启用' : '禁用';
    if (!confirm(`确认${action}用户「${user.username}」？`)) return;

    setPendingId(user.id);
    try {
      const list = await mockApi.toggleUserStatus(user.id);
      setUsers(list);
      showToast(`已${action}用户「${user.username}」`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '操作失败', 'error');
    } finally {
      setPendingId(null);
    }
  };

  const handleRoleChange = async (user: User, role: User['role']) => {
    setPendingId(user.id);
    try {
      const list = await mockApi.updateUserRole(user.id, role);
      setUsers(list);
      showToast(`「${user.username}」角色已调整为${USER_ROLE_MAP[role].label}`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '操作失败', 'error');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="admin-users" id="admin-users">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            <Users size={22} />
            用户管理
          </h1>
          <p className="admin-page-desc">支持调整用户角色与启用 / 禁用账号，当前登录账号不可自我操作</p>
        </div>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-search">
          <Search size={16} />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索用户名 / 手机号"
          />
        </div>
        <span className="admin-filter-count">共 {users.length} 位用户</span>
      </div>

      <div className="admin-panel">
        {loading ? (
          <div className="admin-loading">
            <span className="loading-spinner" />
            <span>正在加载用户...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty">没有符合条件的用户</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>用户</th>
                  <th>手机号</th>
                  <th>角色</th>
                  <th>状态</th>
                  <th>注册时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.username === currentUser?.username;
                  const disabled = user.status === 'DISABLED';
                  const busy = pendingId !== null;
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-table-product">
                          <span
                            className="admin-user-avatar"
                            style={{ width: 36, height: 36, fontSize: 'var(--text-xs)' }}
                          >
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <span className="name">
                              {user.username}
                              {isSelf && '（我）'}
                            </span>
                            <small>ID: {user.id}</small>
                          </div>
                        </div>
                      </td>
                      <td>{user.phone}</td>
                      <td>
                        <select
                          className="admin-select"
                          style={{ height: 34 }}
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value as User['role'])}
                          disabled={isSelf || busy}
                        >
                          {Object.entries(USER_ROLE_MAP).map(([value, item]) => (
                            <option key={value} value={value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span
                          className="status-pill"
                          style={
                            disabled
                              ? { background: '#c83f321a', color: 'var(--color-error)' }
                              : { background: '#2f8f3a1a', color: 'var(--color-success)' }
                          }
                        >
                          {disabled ? '已禁用' : '正常'}
                        </span>
                      </td>
                      <td>{user.createdAt ?? '—'}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            className={`btn btn-sm ${disabled ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleToggleStatus(user)}
                            disabled={isSelf || busy}
                            title={isSelf ? '不能操作当前登录账号' : undefined}
                          >
                            {disabled ? <UserCheck size={14} /> : <UserX size={14} />}
                            {pendingId === user.id ? '...' : disabled ? '启用' : '禁用'}
                          </button>
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

export default AdminUsers;
