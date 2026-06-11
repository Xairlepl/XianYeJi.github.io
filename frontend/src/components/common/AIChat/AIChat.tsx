import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatService } from '@/services/chatService';
import { setProductImageFallback } from '@/utils/imageFallback';
import './AIChat.css';

interface Message {
  id: number;
  type: 'user' | 'bot';
  text: string;
  action?: { type: string; target: string; label: string };
  products?: any[];
}

const AIChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, type: 'bot', text: '您好！我是鲜野集智能客服🌾\n\n我可以帮您：\n• 查询商品\n• 推荐热销\n• 页面导航\n\n试试问我"有什么水果"！' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), type: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);

    const response = chatService.processMessage(input);
    const botMsg: Message = {
      id: Date.now() + 1,
      type: 'bot',
      text: response.text,
      action: response.action,
      products: response.products,
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, botMsg]);
    }, 500);

    setInput('');
  };

  const handleAction = (target: string) => {
    navigate(target);
    setOpen(false);
  };

  return (
    <div className="ai-chat">
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-avatar">🤖</div>
            <div className="chat-title">
              <h3>智能客服</h3>
              <p>在线为您服务</p>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.type}`}>
                <div className="message-avatar">{msg.type === 'user' ? '👤' : '🤖'}</div>
                <div>
                  <div className="message-bubble">{msg.text}</div>
                  {msg.action && (
                    <div className="message-action">
                      <button className="btn btn-primary btn-sm" onClick={() => handleAction(msg.action!.target)}>
                        {msg.action.label} →
                      </button>
                    </div>
                  )}
                  {msg.products && msg.products.length > 0 && (
                    <div className="message-products">
                      {msg.products.map((p) => (
                        <div key={p.id} className="product-mini" onClick={() => handleAction(`/product/${p.id}`)}>
                          <img src={p.coverImage} alt={p.name} onError={(e) => setProductImageFallback(e, p.name)} />
                          <div className="product-mini-info">
                            <div className="product-mini-name">{p.name}</div>
                            <div className="product-mini-price">¥{p.price.toFixed(1)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-box">
            <input
              className="chat-input"
              placeholder="输入您的问题..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="chat-send-btn" onClick={handleSend} disabled={!input.trim()}>
              ➤
            </button>
          </div>
        </div>
      )}

      <button className={`chat-fab ${open ? 'active' : ''}`} onClick={() => setOpen(!open)}>
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default AIChat;
