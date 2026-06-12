import { Link } from 'react-router-dom';
import { SearchX, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <main className="container section" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <div className="empty-state">
        <span className="empty-icon">
          <SearchX size={44} />
        </span>
        <h1 style={{ fontSize: '3rem', margin: '0 0 0.5rem' }}>404</h1>
        <p style={{ color: 'var(--color-neutral-600)', fontSize: 'var(--text-lg)' }}>
          页面不存在或已被删除
        </p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>
          <Home size={16} />
          返回首页
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
