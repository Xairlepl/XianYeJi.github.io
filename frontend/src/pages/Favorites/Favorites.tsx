import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useFavoriteStore } from '@/store/favoriteStore';
import { mockProducts } from '@/data/mockData';
import { setProductImageFallback } from '@/utils/imageFallback';
import './Favorites.css';

const Favorites = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { favoriteIds, toggle } = useFavoriteStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const favoriteProducts = mockProducts.filter((p) => favoriteIds.includes(p.id));

  return (
    <main className="favorites-page container section">
      <h1 className="page-title">❤️ 我的收藏</h1>

      {favoriteProducts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🤍</span>
          <p>暂无收藏商品</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            去逛逛
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {favoriteProducts.map((product) => (
            <div key={product.id} className="favorite-card card">
              <Link to={`/product/${product.id}`} className="favorite-image">
                <img
                  src={product.coverImage}
                  alt={product.name}
                  onError={(e) => setProductImageFallback(e, product.name)}
                />
              </Link>
              <div className="favorite-content">
                <Link to={`/product/${product.id}`} className="favorite-name">
                  {product.name}
                </Link>
                <p className="favorite-origin">📍 {product.origin}</p>
                <div className="favorite-footer">
                  <span className="favorite-price">¥{product.price.toFixed(1)}</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => toggle(product.id)}
                  >
                    取消收藏
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Favorites;
