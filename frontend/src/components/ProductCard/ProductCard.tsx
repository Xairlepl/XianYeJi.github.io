import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { useFavoriteStore } from '@/store/favoriteStore';
import { setProductImageFallback } from '@/utils/imageFallback';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { toggle, isFavorite } = useFavoriteStore();

  return (
    <Link
      to={`/product/${product.id}`}
      className="product-card card"
      id={`product-card-${product.id}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Image */}
      <div className="product-card-image">
        <img
          src={product.coverImage}
          alt={product.name}
          loading="lazy"
          onError={(event) => setProductImageFallback(event, product.name)}
        />
        <div className="product-card-tags">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className={`badge ${tag === '爆款' ? 'badge-hot' : tag === '新鲜' || tag === '有机' ? 'badge-fresh' : 'badge-origin'}`}
            >
              {tag}
            </span>
          ))}
        </div>
        <button
          className={`product-card-favorite ${isFavorite(product.id) ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            toggle(product.id);
          }}
          title={isFavorite(product.id) ? '取消收藏' : '收藏'}
        >
          {isFavorite(product.id) ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Info */}
      <div className="product-card-info">
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-origin">📍 {product.origin}</p>
        <div className="product-card-footer">
          <div className="product-card-price">
            <span className="price-symbol">¥</span>
            <span className="price-value">{product.price.toFixed(1)}</span>
            <span className="price-unit">/{product.unit}</span>
            {product.originalPrice && (
              <span className="price-original">¥{product.originalPrice.toFixed(1)}</span>
            )}
          </div>
          <span className="product-card-sales">已售 {product.sales > 1000 ? `${(product.sales / 1000).toFixed(1)}k` : product.sales}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
