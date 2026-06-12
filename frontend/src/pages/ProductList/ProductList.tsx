import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, ArrowUp, ArrowDown, SlidersHorizontal, ShoppingBag, PackageOpen } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import CategoryIcon from '../../utils/categoryIcons';
import { mockApi } from '../../services/mockApi';
import type { Category, Product } from '../../types';
import './ProductList.css';

const sortOptions: { key: 'default' | 'price-asc' | 'price-desc' | 'sales'; label: string; icon?: React.ReactNode }[] = [
  { key: 'default', label: '综合' },
  { key: 'sales', label: '销量' },
  { key: 'price-asc', label: '价格', icon: <ArrowUp size={13} /> },
  { key: 'price-desc', label: '价格', icon: <ArrowDown size={13} /> },
];

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const keyword = searchParams.get('keyword') ?? '';
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'sales'>('default');
  const [activeCategory, setActiveCategory] = useState<number | null>(
    categoryId ? parseInt(categoryId) : null
  );
  const [stockOnly, setStockOnly] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveCategory(categoryId ? parseInt(categoryId) : null);
  }, [categoryId]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    mockApi
      .getProducts({ categoryId: activeCategory, keyword, sortBy, stockOnly })
      .then((data) => {
        if (!mounted) return;
        setProducts(data.products);
        setCategories(data.categories);
        setTotal(data.total);
        setUpdatedAt(data.updatedAt);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeCategory, keyword, sortBy, stockOnly]);

  const setCategory = (id: number | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (id) nextParams.set('category', String(id));
    else nextParams.delete('category');
    setSearchParams(nextParams);
  };

  const activeCategoryName = activeCategory
    ? categories.find((c) => c.id === activeCategory)?.name
    : '全部商品';

  return (
    <main className="product-list-page container section" id="product-list-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">首页</Link>
        <ChevronRight size={14} />
        <span>{activeCategoryName}</span>
      </nav>

      <div className="product-list-layout">
        {/* Sidebar */}
        <aside className="product-sidebar" id="product-sidebar">
          <h3 className="sidebar-title">商品分类</h3>
          <ul className="sidebar-categories">
            <li>
              <button
                className={`sidebar-cat-btn ${activeCategory === null ? 'active' : ''}`}
                onClick={() => setCategory(null)}
              >
                <ShoppingBag size={18} />
                全部商品
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  className={`sidebar-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  <CategoryIcon id={cat.id} size={18} />
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <div className="product-list-main">
          {/* Sort bar */}
          <div className="sort-bar glass">
            <span className="sort-label">
              <SlidersHorizontal size={15} />
              排序
            </span>
            {sortOptions.map((item) => (
              <button
                key={item.key}
                className={`sort-btn ${sortBy === item.key ? 'active' : ''}`}
                onClick={() => setSortBy(item.key)}
              >
                {item.label}
                {item.icon}
              </button>
            ))}
            <label className="stock-filter">
              <input
                type="checkbox"
                checked={stockOnly}
                onChange={(event) => setStockOnly(event.target.checked)}
              />
              仅看有货
            </label>
            <span className="sort-count">共 {total} 件商品</span>
          </div>

          <div className="list-meta">
            {keyword ? <span>“{keyword}” 的搜索结果</span> : <span>{activeCategoryName} · 为您精选 {total} 件优质好物</span>}
            <span>数据更新于 {updatedAt}</span>
          </div>

          {/* Products */}
          {loading ? (
            <div className="list-loading">
              <span className="loading-spinner" />
              <span>正在加载商品...</span>
            </div>
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <PackageOpen size={40} />
              </span>
              <p>没有找到相关商品</p>
              <Link to="/products" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
                查看全部商品
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ProductList;
