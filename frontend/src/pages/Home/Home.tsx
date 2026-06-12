import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sprout, Snowflake, BadgeCheck, ShieldCheck } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import CategoryIcon from '../../utils/categoryIcons';
import { mockApi } from '../../services/mockApi';
import { setProductImageFallback } from '../../utils/imageFallback';
import './Home.css';

type HomeData = Awaited<ReturnType<typeof mockApi.getHomeData>>;

const heroImages = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&h=900&fit=crop',
  'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=1600&h=900&fit=crop',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&h=900&fit=crop',
];

const serviceHighlights = [
  { Icon: Sprout, title: '产地直采', desc: '合作基地统一分级，减少中间周转' },
  { Icon: Snowflake, title: '冷链履约', desc: '生鲜、肉禽、乳品按品类控温发货' },
  { Icon: BadgeCheck, title: '到仓质检', desc: '入仓抽检、溯源码、批次信息可查' },
  { Icon: ShieldCheck, title: '售后无忧', desc: '坏果包赔，订单问题快速响应' },
];

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
          <span>正在加载首页内容...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="home" id="home-page">
      <section className="hero-section" id="hero-banner">
        <div className="hero-slider">
          {homeData.banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`hero-slide ${index === currentBanner ? 'active' : ''}`}
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(20, 26, 19, 0.74) 0%, rgba(20, 26, 19, 0.48) 48%, rgba(20, 26, 19, 0.12) 100%), url(${heroImages[index % heroImages.length]})`,
              }}
            >
              <div className="hero-content container">
                <div className="hero-copy">
                  <span className="hero-kicker">鲜野集直采档期</span>
                  <h1 className="hero-title">{banner.title}</h1>
                  <p className="hero-subtitle">{banner.subtitle}</p>
                  <div className="hero-actions">
                    <Link to={banner.link} className="btn btn-accent btn-lg hero-cta">
                      立即选购
                    </Link>
                    <Link to="/products" className="btn btn-secondary btn-lg hero-secondary">
                      查看全部
                    </Link>
                  </div>
                  <div className="hero-proof" aria-label="服务承诺">
                    <span>48小时产地发货</span>
                    <span>批次溯源</span>
                    <span>坏果包赔</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hero-dots" aria-label="切换轮播">
          {homeData.banners.map((banner, index) => (
            <button
              key={banner.id}
              className={`hero-dot ${index === currentBanner ? 'active' : ''}`}
              onClick={() => setCurrentBanner(index)}
              aria-label={`切换到第 ${index + 1} 张轮播`}
              type="button"
            />
          ))}
        </div>
      </section>

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

      <section className="service-section container" aria-label="服务优势">
        <div className="service-list">
          {serviceHighlights.map(({ Icon, title, desc }, index) => (
            <div key={title} className="service-item" style={{ animationDelay: `${index * 0.08}s` }}>
              <span className="service-icon">
                <Icon size={24} />
              </span>
              <div>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section container" id="categories-section">
        <div className="section-header">
          <div>
            <span className="section-kicker">Category</span>
            <h2 className="section-title">按餐桌场景选购</h2>
          </div>
          <Link to="/products" className="section-more">
            全部分类
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="category-grid">
          {homeData.categories.map((cat, index) => (
            <Link
              to={`/products?category=${cat.id}`}
              key={cat.id}
              className="category-item"
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <span className="category-icon">
                <CategoryIcon id={cat.id} size={28} />
              </span>
              <span className="category-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section container" id="hot-products-section">
        <div className="section-header">
          <div>
            <span className="section-kicker">Best Sellers</span>
            <h2 className="section-title">本周热销</h2>
          </div>
          <Link to="/products" className="section-more">
            更多商品
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="products-grid">
          {homeData.hotProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

      <section className="section container feature-band" id="fresh-products-section">
        <div className="section-header">
          <div>
            <span className="section-kicker">New Arrival</span>
            <h2 className="section-title">新鲜到家</h2>
          </div>
          <Link to="/products" className="section-more">
            查看新货
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="products-grid">
          {homeData.freshProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

      <section className="section container" id="farm-stories-section">
        <div className="section-header">
          <div>
            <span className="section-kicker">Origin</span>
            <h2 className="section-title">产地溯源</h2>
          </div>
          <Link to="/products" className="section-more">
            按产地选购
            <ArrowRight size={16} />
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
                <span className="farm-story-location">{story.location}</span>
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

      <section className="section container" id="recommend-section">
        <div className="section-header">
          <div>
            <span className="section-kicker">For You</span>
            <h2 className="section-title">为你推荐</h2>
          </div>
        </div>
        <div className="products-grid products-grid-dense">
          {homeData.recommendProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;
