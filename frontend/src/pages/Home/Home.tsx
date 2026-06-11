import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { mockApi } from '../../services/mockApi';
import { setProductImageFallback } from '../../utils/imageFallback';
import './Home.css';

type HomeData = Awaited<ReturnType<typeof mockApi.getHomeData>>;

const Home = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    mockApi.getHomeData().then((data) => {
      if (!mounted) return;
      setHomeData(data);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!homeData?.banners.length) return;

    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % homeData.banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [homeData?.banners.length]);

  if (loading || !homeData) {
    return (
      <main className="home" id="home-page">
        <div className="page-loading">
          <span className="loading-spinner" />
          <span>正在从模拟后端加载首页内容...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="home" id="home-page">
      {/* ======== Hero Banner ======== */}
      <section className="hero-section" id="hero-banner">
        <div className="hero-slider">
          {homeData.banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`hero-slide ${index === currentBanner ? 'active' : ''}`}
              style={{ background: banner.gradient }}
            >
              <div className="hero-content container">
                <div className="hero-text">
                  <h1 className="hero-title">{banner.title}</h1>
                  <p className="hero-subtitle">{banner.subtitle}</p>
                  <Link to={banner.link} className="btn btn-accent btn-lg hero-cta">
                    立即选购 →
                  </Link>
                </div>
                <div className="hero-visual">
                  <div className="hero-decoration">
                    <span className="deco-emoji deco-1">🍎</span>
                    <span className="deco-emoji deco-2">🥬</span>
                    <span className="deco-emoji deco-3">🌾</span>
                    <span className="deco-emoji deco-4">🍊</span>
                    <span className="deco-emoji deco-5">🥩</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Dots */}
        <div className="hero-dots">
          {homeData.banners.map((_, index) => (
            <button
              key={index}
              className={`hero-dot ${index === currentBanner ? 'active' : ''}`}
              onClick={() => setCurrentBanner(index)}
              aria-label={`Banner ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ======== Platform Stats ======== */}
      <section className="home-stats-band">
        <div className="home-stats container">
          {homeData.platformStats.map((stat) => (
            <div key={stat.label} className="home-stat-item">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ======== Service Highlights ======== */}
      <section className="service-section container">
        <div className="service-list">
          {[
            { icon: '🚚', title: '产地直发', desc: '源头直采，减少中间环节' },
            { icon: '❄️', title: '冷链配送', desc: '全程冷链，锁住新鲜' },
            { icon: '✅', title: '品质保障', desc: '严格质检，放心购买' },
            { icon: '💰', title: '售后无忧', desc: '7天无理由退换货' },
          ].map((item, i) => (
            <div key={i} className="service-item glass" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="service-icon">{item.icon}</span>
              <div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======== Categories ======== */}
      <section className="section container" id="categories-section">
        <div className="section-header">
          <h2 className="section-title">🏷️ 精选分类</h2>
          <Link to="/products" className="section-more">
            查看全部 →
          </Link>
        </div>
        <div className="category-grid">
          {homeData.categories.map((cat, i) => (
            <Link
              to={`/products?category=${cat.id}`}
              key={cat.id}
              className="category-item"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ======== Hot Products ======== */}
      <section className="section container" id="hot-products-section">
        <div className="section-header">
          <h2 className="section-title">🔥 热销爆款</h2>
          <Link to="/products" className="section-more">
            更多 →
          </Link>
        </div>
        <div className="products-grid">
          {homeData.hotProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* ======== Fresh Products ======== */}
      <section className="section container" id="fresh-products-section">
        <div className="section-header">
          <h2 className="section-title">🌿 新鲜到家</h2>
          <Link to="/products" className="section-more">
            更多 →
          </Link>
        </div>
        <div className="products-grid">
          {homeData.freshProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* ======== Farm Stories ======== */}
      <section className="section container" id="farm-stories-section">
        <div className="section-header">
          <h2 className="section-title">产地溯源</h2>
          <Link to="/products" className="section-more">
            按产地选购 →
          </Link>
        </div>
        <div className="farm-story-grid">
          {homeData.farmStories.map((story) => (
            <article key={story.id} className="farm-story-card card">
              <img
                src={story.image}
                alt={story.title}
                onError={(event) => setProductImageFallback(event, story.title)}
              />
              <div className="farm-story-content">
                <span className="farm-story-location">📍 {story.location}</span>
                <h3>{story.title}</h3>
                <p>{story.summary}</p>
                <div className="farm-story-tags">
                  {story.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ======== Recommend ======== */}
      <section className="section container" id="recommend-section">
        <div className="section-header">
          <h2 className="section-title">✨ 为你推荐</h2>
        </div>
        <div className="products-grid products-grid-dense">
          {homeData.recommendProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;
