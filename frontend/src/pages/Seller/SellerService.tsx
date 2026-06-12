import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MessageCircle, Package, RefreshCw, Send, User } from 'lucide-react';
import { mockApi } from '@/services/mockApi';
import { useToastStore } from '@/store/toastStore';
import { setProductImageFallback } from '@/utils/imageFallback';
import type { ServiceConversation } from '@/types';

const getUnreadCount = (conversation: ServiceConversation) =>
  conversation.messages.filter((message) => message.senderRole === 'CUSTOMER' && !message.read).length;

const getLastMessage = (conversation: ServiceConversation) =>
  conversation.messages[conversation.messages.length - 1]?.content ?? '暂无消息';

const SellerService = () => {
  const showToast = useToastStore((state) => state.show);
  const [conversations, setConversations] = useState<ServiceConversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeConversation, setActiveConversation] = useState<ServiceConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const list = await mockApi.getSellerServiceConversations();
      setConversations(list);
      setActiveId((current) => current ?? list[0]?.id ?? null);
      if (list.length === 0) setActiveConversation(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : '客服会话加载失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadConversations();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadConversations]);

  useEffect(() => {
    if (!activeId) return;

    let mounted = true;
    const timer = window.setTimeout(() => {
      setConversationLoading(true);
      mockApi
        .getSellerServiceConversation(activeId)
        .then((conversation) => {
          if (!mounted) return;
          setActiveConversation(conversation);
          setConversations((prev) => prev.map((item) => (item.id === conversation.id ? conversation : item)));
        })
        .catch((error) => {
          if (mounted) showToast(error instanceof Error ? error.message : '客服会话加载失败', 'error');
        })
        .finally(() => {
          if (mounted) setConversationLoading(false);
        });
    }, 0);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [activeId, showToast]);

  const stats = useMemo(() => {
    const unread = conversations.reduce((sum, conversation) => sum + getUnreadCount(conversation), 0);
    const customers = new Set(conversations.map((conversation) => conversation.customerId)).size;
    return { unread, customers };
  }, [conversations]);

  const handleReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeConversation || !reply.trim() || sending) return;

    setSending(true);
    try {
      const conversation = await mockApi.sellerSendServiceReply(activeConversation.id, reply);
      setActiveConversation(conversation);
      setReply('');
      const list = await mockApi.getSellerServiceConversations();
      setConversations(list);
      showToast('回复已发送', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '回复发送失败', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="seller-service" id="seller-service">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            <MessageCircle size={22} />
            商家客服
          </h1>
          <p className="admin-page-desc">查看会员针对本店商品发起的咨询，并及时回复</p>
        </div>
        <button className="btn btn-secondary" onClick={loadConversations} disabled={loading}>
          <RefreshCw size={16} />
          刷新
        </button>
      </div>

      <div className="admin-stats-grid service-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-icon">
            <MessageCircle size={24} />
          </span>
          <span className="admin-stat-info">
            <span className="admin-stat-value">{conversations.length}</span>
            <span className="admin-stat-label">咨询会话</span>
          </span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon warn">
            <Clock size={24} />
          </span>
          <span className="admin-stat-info">
            <span className="admin-stat-value">{stats.unread}</span>
            <span className="admin-stat-label">会员未读提问</span>
          </span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon info">
            <User size={24} />
          </span>
          <span className="admin-stat-info">
            <span className="admin-stat-value">{stats.customers}</span>
            <span className="admin-stat-label">咨询会员</span>
          </span>
        </div>
      </div>

      <div className="admin-panel service-workbench">
        <aside className="service-conversation-list" aria-label="客服会话列表">
          {loading ? (
            <div className="admin-loading service-loading">
              <span className="loading-spinner" />
              <span>正在加载会话...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="admin-empty">暂无会员咨询</div>
          ) : (
            conversations.map((conversation) => {
              const unread = getUnreadCount(conversation);
              return (
                <button
                  key={conversation.id}
                  className={`service-conversation-item ${activeId === conversation.id ? 'active' : ''}`}
                  onClick={() => setActiveId(conversation.id)}
                >
                  <img
                    src={conversation.productImage}
                    alt={conversation.productName}
                    onError={(event) => setProductImageFallback(event, conversation.productName)}
                  />
                  <span className="service-conversation-copy">
                    <span className="service-conversation-title">
                      <strong>{conversation.customerName}</strong>
                      {unread > 0 && <em>{unread}</em>}
                    </span>
                    <span className="service-conversation-product">{conversation.productName}</span>
                    <span className="service-conversation-last">{getLastMessage(conversation)}</span>
                  </span>
                </button>
              );
            })
          )}
        </aside>

        <section className="service-chat-panel" aria-label="客服聊天窗口">
          {conversationLoading ? (
            <div className="admin-loading service-loading">
              <span className="loading-spinner" />
              <span>正在打开会话...</span>
            </div>
          ) : activeConversation ? (
            <>
              <div className="service-chat-header">
                <div className="service-chat-product">
                  <img
                    src={activeConversation.productImage}
                    alt={activeConversation.productName}
                    onError={(event) => setProductImageFallback(event, activeConversation.productName)}
                  />
                  <div>
                    <strong>{activeConversation.customerName}</strong>
                    <Link to={`/product/${activeConversation.productId}`}>
                      <Package size={13} />
                      {activeConversation.productName}
                    </Link>
                  </div>
                </div>
                <time>{activeConversation.updatedAt}</time>
              </div>

              <div className="service-chat-messages">
                {activeConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`service-chat-message ${message.senderRole === 'SELLER' ? 'seller' : 'customer'}`}
                  >
                    <div className="service-chat-meta">
                      <strong>{message.senderName}</strong>
                      <time>{message.createdAt}</time>
                    </div>
                    <p>{message.content}</p>
                  </div>
                ))}
              </div>

              <form className="service-reply-box" onSubmit={handleReply}>
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="输入回复内容"
                  rows={3}
                  disabled={sending}
                />
                <button type="submit" className="btn btn-accent" disabled={!reply.trim() || sending}>
                  <Send size={16} />
                  {sending ? '发送中...' : '发送回复'}
                </button>
              </form>
            </>
          ) : (
            <div className="admin-empty">选择一个会话后开始回复会员</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SellerService;
