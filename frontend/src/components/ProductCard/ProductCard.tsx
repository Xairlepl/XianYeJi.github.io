import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { Product } from '@/types';
import { useFavoriteStore } from '@/store/favoriteStore';
import { setProductImageFallback } from '@/utils/imageFallback';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const formatSales = (sales: number) => {
  if (sales >= 10000) return `${(sales / 10000).toFixed(1)}万`;
  if (sales >= 1000) return `${(sales / 1000).toFixed(1)}k`;
  return String(sales);
};

const getBadgeClass = (tag: string) => {
  if (['爆款', '热销', '应季'].includes(tag)) return 'badge-hot';
  if (['新鲜', '有机', '冷链'].includes(tag)) return 'badge-fresh';
  return 'badge-origin';
};

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { toggle, isFavorite } = useFavoriteStore();
  const favorite = isFavorite(product.id);

  return (
    <article
      className="product-card card"
      id={`product-card-${product.id}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <Link to={`/product/${product.id}`} className="product-card-link" aria-label={`查看${product.name}`}>
        <div className="product-card-image">
          <img
            src={product.coverImage}
            alt={product.name}
            loading="lazy"
            onError={(event) => setProductImageFallback(event, product.name)}
          />
          <div className="product-card-tags">
            {product.tags.slice(0, 2).map((tag) => (
              <span key={tag} className={`badge ${getBadgeClass(tag)}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="product-card-info">
          <div className="product-card-meta">
            <span>{product.origin}</span>
            <span>{product.stock > 0 ? '现货' : '售罄'}</span>
          </div>
          <h3 className="product-card-name">{product.name}</h3>
          <p className="product-card-seller">{product.sellerName}</p>
          <div className="product-card-footer">
            <div className="product-card-price">
              <span className="price-symbol">¥</span>
              <span className="price-value">{product.price.toFixed(1)}</span>
              <span className="price-unit">/{product.unit}</span>
              {product.originalPrice && (
                <span className="price-original">¥{product.originalPrice.toFixed(1)}</span>
              )}
            </div>
            <span className="product-card-sales">已售 {formatSales(product.sales)}</span>
          </div>
        </div>
      </Link>

      <button
        className={`product-card-favorite ${favorite ? 'active' : ''}`}
        onClick={() => toggle(product.id)}
        title={favorite ? '取消收藏' : '收藏'}
        aria-label={favorite ? `取消收藏${product.name}` : `收藏${product.name}`}
        aria-pressed={favorite}
        type="button"
      >
        <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
      </button>
    </article>
  );
};

export default ProductCard;
