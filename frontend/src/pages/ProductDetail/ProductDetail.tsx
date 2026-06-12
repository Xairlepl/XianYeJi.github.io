import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  MapPin,
  Package,
  Truck,
  Clock,
  Minus,
  Plus,
  ShoppingCart,
  ShoppingBag,
  Heart,
  Sprout,
  Award,
  ShieldCheck,
  Leaf,
  PackageX,
  QrCode,
  ClipboardCheck,
  PackageCheck,
  Warehouse,
  Route,
} from 'lucide-react';
import { mockApi } from '@/services/mockApi';
import { useCartStore } from '@/store/cartStore';
import { useToastStore } from '@/store/toastStore';
import { useFavoriteStore } from '@/store/favoriteStore';
import ProductCard from '@/components/ProductCard/ProductCard';
import StarRating from '@/components/common/StarRating/StarRating';
import type { Product, ProductReview, Traceability } from '@/types';
import { setProductImageFallback } from '@/utils/imageFallback';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [traceability, setTraceability] = useState<Traceability | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'detail' | 'origin' | 'reviews'>('detail');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'cart' | 'buy' | null>(null);

  const addToCart = useCartStore((state) => state.addItem);
  const showToast = useToastStore((state) => state.show);
  const { toggle: toggleFavorite, isFavorite } = useFavoriteStore();

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    mockApi.getProductDetail(Number(id)).then((data) => {
      if (!mounted) return;
      setProduct(data.product);
      setRelated(data.related);
      setReviews(data.reviews);
      setTraceability(data.traceability);
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
        <span>正在加载商品详情...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section empty-state">
        <span className="empty-icon">
          <PackageX size={40} />
        </span>
        <p>商品不存在或已下架</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
          返回商品列表
        </Link>
      </div>
    );
  }

  const favorite = isFavorite(product.id);

  return (
    <main className="detail-page container section" id="product-detail-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">首页</Link>
        <ChevronRight size={14} />
        <Link to="/products">{product.categoryName}</Link>
        <ChevronRight size={14} />
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
              <span className="meta-value">
                <MapPin size={15} />
                {product.origin}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">库存</span>
              <span className="meta-value">
                <Package size={15} />
                {product.stock} {product.unit}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">运费</span>
              <span className="meta-value">
                <Truck size={15} />
                <span style={{ color: 'var(--color-primary-600)', fontWeight: 700 }}>全场包邮</span>
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">发货</span>
              <span className="meta-value">
                <Clock size={15} />
                48小时内从产地发出
              </span>
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
                aria-label="减少数量"
              >
                <Minus size={16} />
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                className="qty-btn"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                aria-label="增加数量"
              >
                <Plus size={16} />
              </button>
            </div>
            {quantity >= product.stock && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>
                已达最大库存
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="detail-actions">
            <button
              className="btn btn-accent btn-lg detail-buy-btn"
              id="buy-now-btn"
              onClick={handleBuyNow}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'buy' ? (
                '生成订单中...'
              ) : (
                <>
                  <ShoppingBag size={18} />
                  立即购买
                </>
              )}
            </button>
            <button
              className="btn btn-secondary btn-lg detail-cart-btn"
              id="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'cart' ? (
                '加入中...'
              ) : (
                <>
                  <ShoppingCart size={18} />
                  加入购物车
                </>
              )}
            </button>
            <button
              className={`btn btn-secondary btn-lg detail-fav-btn ${favorite ? 'active' : ''}`}
              onClick={() => {
                toggleFavorite(product.id);
                showToast(favorite ? '已取消收藏' : '已添加到收藏', 'success');
              }}
              title={favorite ? '取消收藏' : '收藏商品'}
              aria-label={favorite ? '取消收藏' : '收藏商品'}
            >
              <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Guarantees */}
          <div className="detail-guarantee">
            <div className="guarantee-item">
              <ShieldCheck size={18} />
              <span>正品保障</span>
            </div>
            <div className="guarantee-item">
              <Truck size={18} />
              <span>产地直发</span>
            </div>
            <div className="guarantee-item">
              <Leaf size={18} />
              <span>坏果包赔</span>
            </div>
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
            用户评价（{reviews.length}）
          </button>
        </div>
        <div className="detail-tab-content">
          {activeTab === 'detail' ? (
            <div className="tab-detail">
              <p>{product.description}</p>
              <div className="detail-features">
                <div className="feature-item">
                  <span className="feature-icon">
                    <Sprout size={22} />
                  </span>
                  <div>
                    <h4>绿色种植</h4>
                    <p>严格按照绿色食品标准种植，不使用违禁农药</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">
                    <Package size={22} />
                  </span>
                  <div>
                    <h4>精选包装</h4>
                    <p>专业防损包装，保证运输过程中产品完好</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">
                    <Award size={22} />
                  </span>
                  <div>
                    <h4>品质认证</h4>
                    <p>通过国家农产品质量安全检测，食用更安心</p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'origin' ? (
            <div className="tab-origin">
              {traceability ? (
                <>
                  <div className="trace-grid">
                    <div className="trace-code-card">
                      <span className="trace-qr">
                        <QrCode size={56} />
                      </span>
                      <div className="trace-code-info">
                        <small>商品溯源码</small>
                        <strong className="trace-code">{traceability.traceCode}</strong>
                        <div className="trace-code-meta">
                          <span>批次号：{traceability.batchNo}</span>
                          <span>采收日期：{traceability.harvestDate}</span>
                        </div>
                        <div className="trace-certs">
                          {traceability.certifications.map((cert) => (
                            <span key={cert} className="badge badge-fresh">
                              <Award size={12} />
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="trace-info-card">
                      <h4>
                        <Sprout size={17} />
                        种植 / 养殖主体
                      </h4>
                      <p className="trace-grower">
                        <strong>{traceability.grower}</strong>
                        <span className="trace-grower-origin">
                          <MapPin size={13} />
                          {product.origin}
                        </span>
                      </p>
                      <p>{traceability.growerIntro}</p>
                      <p className="trace-method">{traceability.plantingMethod}</p>
                    </div>

                    <div className="trace-info-card">
                      <h4>
                        <ClipboardCheck size={17} />
                        质检报告
                      </h4>
                      <p>检测机构：{traceability.inspection.agency}</p>
                      <p>
                        报告编号：{traceability.inspection.reportNo} · {traceability.inspection.date}
                      </p>
                      <div className="trace-inspection-items">
                        {traceability.inspection.items.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>
                      <span className="trace-inspection-result">
                        <ShieldCheck size={14} />
                        {traceability.inspection.result}
                      </span>
                    </div>
                  </div>

                  <div className="trace-timeline-card">
                    <h4>
                      <Route size={17} />
                      流通链路（产地直发，全程可追溯）
                    </h4>
                    <ol className="trace-timeline">
                      {traceability.steps.map((step, index) => {
                        const StepIcon = [Sprout, PackageCheck, ClipboardCheck, Truck, Warehouse][index] ?? Truck;
                        return (
                          <li key={step.title} className="trace-step">
                            <span className="trace-step-icon">
                              <StepIcon size={17} />
                            </span>
                            <div className="trace-step-body">
                              <div className="trace-step-head">
                                <strong>{step.title}</strong>
                                <time>{step.time}</time>
                              </div>
                              <p>{step.desc}</p>
                              <span className="trace-step-location">
                                <MapPin size={12} />
                                {step.location}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </>
              ) : (
                <div className="empty-state compact">
                  <p>暂无溯源信息</p>
                </div>
              )}
            </div>
          ) : (
            <div className="review-list">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <article key={review.id} className="review-card">
                    <div className="review-card-header">
                      <strong>{review.username}</strong>
                      <StarRating rating={review.rating} size={15} />
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
