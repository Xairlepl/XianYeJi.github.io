import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockApi } from '@/services/mockApi';
import { useCartStore } from '@/store/cartStore';
import { useToastStore } from '@/store/toastStore';
import ProductCard from '@/components/ProductCard/ProductCard';
import type { Product, ProductReview } from '@/types';
import { setProductImageFallback } from '@/utils/imageFallback';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'detail' | 'origin' | 'reviews'>('detail');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'cart' | 'buy' | null>(null);

  const addToCart = useCartStore((state) => state.addItem);
  const showToast = useToastStore((state) => state.show);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    mockApi.getProductDetail(Number(id)).then((data) => {
      if (!mounted) return;
      setProduct(data.product);
      setRelated(data.related);
      setReviews(data.reviews);
      setQuantity(1);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setActionLoading('cart');

    try {
      await addToCart(product.id, quantity);
      showToast(`已将 ${quantity} ${product.unit}加入购物车`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '加入购物车失败', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    setActionLoading('buy');

    try {
      await mockApi.buyNow(product.id, quantity);
      showToast('订单创建成功', 'success');
      navigate('/orders');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '创建订单失败', 'error');
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="container section page-loading">
        <span className="loading-spinner" />
        <span>正在请求模拟商品详情...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section empty-state">
        <span className="empty-icon">😅</span>
        <p>商品不存在</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>返回商品列表</Link>
      </div>
    );
  }

  return (
    <main className="detail-page container section" id="product-detail-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">首页</Link>
        <span>/</span>
        <Link to="/products">{product.categoryName}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      {/* Product Main */}
      <div className="detail-main">
        {/* Image Gallery */}
        <div className="detail-gallery">
          <div className="detail-main-image">
            <img
              src={product.coverImage}
              alt={product.name}
              onError={(event) => setProductImageFallback(event, product.name)}
            />
            <div className="detail-tags">
              {product.tags.map((tag) => (
                <span key={tag} className={`badge ${tag === '爆款' ? 'badge-hot' : 'badge-fresh'}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="detail-info">
          <h1 className="detail-name">{product.name}</h1>
          <p className="detail-desc-short">{product.description}</p>

          {/* Price */}
          <div className="detail-price-box">
            <div className="detail-price-row">
              <span className="detail-price-label">促销价</span>
              <span className="detail-price-symbol">¥</span>
              <span className="detail-price-value">{product.price.toFixed(1)}</span>
              <span className="detail-price-unit">/{product.unit}</span>
              {product.originalPrice && (
                <span className="detail-price-original">¥{product.originalPrice.toFixed(1)}</span>
              )}
            </div>
            <div className="detail-price-save">
              {product.originalPrice && (
                <span className="save-tag">
                  省 ¥{(product.originalPrice - product.price).toFixed(1)}
                </span>
              )}
              <span className="sales-info">已售 {product.sales} {product.unit}</span>
            </div>
          </div>

          {/* Meta */}
          <div className="detail-meta">
            <div className="meta-item">
              <span className="meta-label">产地</span>
              <span className="meta-value">📍 {product.origin}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">库存</span>
              <span className="meta-value">{product.stock} {product.unit}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">运费</span>
              <span className="meta-value" style={{ color: 'var(--color-primary-600)' }}>包邮</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">发货</span>
              <span className="meta-value">48小时内从产地发出</span>
            </div>
          </div>

          {/* Quantity */}
          <div className="detail-quantity">
            <span className="meta-label">数量</span>
            <div className="quantity-control">
              <button
                className="qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                className="qty-btn"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="detail-actions">
            <button
              className="btn btn-accent btn-lg detail-buy-btn"
              id="buy-now-btn"
              onClick={handleBuyNow}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'buy' ? '生成订单中...' : '🛒 立即购买'}
            </button>
            <button
              className="btn btn-secondary btn-lg detail-cart-btn"
              id="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'cart' ? '加入中...' : '加入购物车'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <div className="detail-tab-header">
          <button
            className={`tab-btn ${activeTab === 'detail' ? 'active' : ''}`}
            onClick={() => setActiveTab('detail')}
          >
            商品详情
          </button>
          <button
            className={`tab-btn ${activeTab === 'origin' ? 'active' : ''}`}
            onClick={() => setActiveTab('origin')}
          >
            产地溯源
          </button>
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            用户评价
          </button>
        </div>
        <div className="detail-tab-content">
          {activeTab === 'detail' ? (
            <div className="tab-detail">
              <p>{product.description}</p>
              <div className="detail-features">
                <div className="feature-item">
                  <span className="feature-icon">🌱</span>
                  <div>
                    <h4>绿色种植</h4>
                    <p>严格按照绿色食品标准种植，不使用违禁农药</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📦</span>
                  <div>
                    <h4>精选包装</h4>
                    <p>专业防损包装，保证运输过程中产品完好</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🏅</span>
                  <div>
                    <h4>品质认证</h4>
                    <p>通过国家农产品质量安全检测，食用更安心</p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'origin' ? (
            <div className="tab-origin">
              <div className="origin-card glass">
                <h4>📍 产地信息</h4>
                <p><strong>产地：</strong>{product.origin}</p>
                <p><strong>供应商：</strong>{product.sellerName}</p>
                <p><strong>种植/养殖方式：</strong>生态有机种植，自然成熟采摘</p>
                <p><strong>质量认证：</strong>绿色食品认证 / 有机产品认证</p>
              </div>
            </div>
          ) : (
            <div className="review-list">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <article key={review.id} className="review-card">
                    <div className="review-card-header">
                      <strong>{review.username}</strong>
                      <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    <p>{review.content}</p>
                    <time>{review.createdAt}</time>
                  </article>
                ))
              ) : (
                <div className="empty-state compact">
                  <p>暂无评价，购买后可发表体验</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="detail-related">
          <h2 className="section-title">相关推荐</h2>
          <div className="products-grid">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default ProductDetail;
