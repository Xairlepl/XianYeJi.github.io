import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { mockApi } from '@/services/mockApi';
import type { Notification } from '@/types';
import './Notifications.css';

const Notifications = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const showToast = useToastStore((state) => state.show);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    const data = await mockApi.getProfileData();
    setNotifications(data.notifications);
    setLoading(false);
  };

  const handleMarkRead = async (id: number) => {
    const updated = await mockApi.markNotificationRead(id);
    setNotifications(updated);
  };

  const handleMarkAllRead = async () => {
    const updated = await mockApi.markAllNotificationsRead();
    setNotifications(updated);
    showToast('已全部标为已读', 'success');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <main className="notifications-page container section">
        <div className="page-loading">
          <span className="loading-spinner" />
          <span>加载中...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="notifications-page container section">
      <div className="page-header">
        <h1 className="page-title">💬 消息通知</h1>
        {unreadCount > 0 && (
          <button className="btn btn-primary btn-sm" onClick={handleMarkAllRead}>
            全部已读
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>暂无消息</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-card card ${notif.read ? '' : 'unread'}`}
              onClick={() => !notif.read && handleMarkRead(notif.id)}
              style={{ cursor: notif.read ? 'default' : 'pointer' }}
            >
              <div className="notification-icon">
                {notif.type === 'ORDER' && '📦'}
                {notif.type === 'PROMOTION' && '🎁'}
                {notif.type === 'SYSTEM' && 'ℹ️'}
              </div>
              <div className="notification-content">
                <h3 className="notification-title">{notif.title}</h3>
                <p className="notification-text">{notif.content}</p>
                <span className="notification-time">{notif.createdAt}</span>
              </div>
              {!notif.read && <span className="unread-dot" />}
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Notifications;
