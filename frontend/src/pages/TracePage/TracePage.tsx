import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Award,
  Sprout,
  ClipboardCheck,
  ShieldCheck,
  Route,
  PackageCheck,
  Truck,
  Warehouse,
  SearchX,
  Home,
  ChevronLeft,
} from 'lucide-react';
import { mockApi } from '@/services/mockApi';
import TraceQrCode from '@/components/common/TraceQrCode/TraceQrCode';
import type { Product, Traceability } from '@/types';
import { setProductImageFallback } from '@/utils/imageFallback';
import './TracePage.css';

const TracePage = () => {
  const { traceCode } = useParams<{ traceCode: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [traceability, setTraceability] = useState<Traceability | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setNotFound(false);

    if (!traceCode) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    mockApi.getTraceabilityByCode(traceCode).then((data) => {
      if (!mounted) return;
      if (!data.product || !data.traceability) {
        setNotFound(true);
      } else {
        setProduct(data.product);
        setTraceability(data.traceability);
      }
      setLoading(false);
    }).catch(() => {
      if (!mounted) return;
      setNotFound(true);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [traceCode]);

  const traceQrValue = useMemo(() => {
    if (!traceability) return '';
    if (typeof window === 'undefined') return traceability.traceCode;
    // 构建当前溯源页 URL，适配 GitHub Pages basename
    const parts = window.location.pathname.split('/');
    const isGitHubPages = parts[1] === 'XianYeJi.github.io';
    const prefix = isGitHubPages ? '/XianYeJi.github.io' : '';
    return `${window.location.origin}${prefix}/trace/${traceability.traceCode}`;
  }, [traceability]);

  if (loading) {
    return (
      <main className="trace-page container section">
        <div className="page-loading">
          <span className="loading-spinner" />
          <span>正在加载溯源信息...</span>
        </div>
      </main>
    );
  }

  if (notFound || !product || !traceability) {
    return (
      <main className="trace-page container section" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div className="empty-state">
          <span className="empty-icon">
            <SearchX size={44} />
          </span>
          <h2>未找到溯源信息</h2>
          <p style={{ color: 'var(--color-neutral-600)' }}>
            溯源码无效或对应商品已下架
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>
            <Home size={16} />
            返回首页
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="trace-page container section">
      {/* 页头：商品信息 */}
      <div className="trace-page-header">
        <Link to={`/product/${product.id}`} className="trace-back-link">
          <ChevronLeft size={18} />
          查看商品详情
        </Link>
        <div className="trace-product-summary">
          <img
            src={product.coverImage}
            alt={product.name}
            className="trace-product-thumb"
            onError={(event) => setProductImageFallback(event, product.name)}
          />
          <div>
            <h1 className="trace-product-name">{product.name}</h1>
            <p className="trace-product-origin">
              <MapPin size={14} />
              {product.origin}
            </p>
          </div>
        </div>
      </div>

      {/* 溯源卡片网格 */}
      <div className="trace-grid">
        <div className="trace-code-card">
          <span className="trace-qr">
            <TraceQrCode
              value={traceQrValue}
              size={104}
              title={`${product.name} 产地溯源二维码`}
            />
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

      {/* 流通时间线 */}
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

      {/* 底部操作 */}
      <div className="trace-page-footer">
        <Link to={`/product/${product.id}`} className="btn btn-primary">
          购买 {product.name}
        </Link>
      </div>
    </main>
  );
};

export default TracePage;
