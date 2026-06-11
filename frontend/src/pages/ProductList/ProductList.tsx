import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { mockApi } from '../../services/mockApi';
import type { Category, Product } from '../../types';
import './ProductList.css';

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

  return (
    <main className="product-list-page container section" id="product-list-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">首页</Link>
        <span>/</span>
        <span>{activeCategory ? categories.find((c) => c.id === activeCategory)?.name : '全部商品'}</span>
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
                全部商品
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  className={`sidebar-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  <span>{cat.icon}</span> {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <div className="product-list-main">
          {/* Sort bar */}
          <div className="sort-bar glass">
            <span className="sort-label">排序：</span>
            {[
              { key: 'default', label: '综合' },
              { key: 'sales', label: '销量' },
              { key: 'price-asc', label: '价格↑' },
              { key: 'price-desc', label: '价格↓' },
            ].map((item) => (
              <button
                key={item.key}
                className={`sort-btn ${sortBy === item.key ? 'active' : ''}`}
                onClick={() => setSortBy(item.key as typeof sortBy)}
              >
                {item.label}
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
            {keyword ? <span>搜索结果：{keyword}</span> : <span>模拟接口更新时间：{updatedAt}</span>}
            <span>筛选、排序、库存切换均通过 mockApi 异步返回</span>
          </div>

          {/* Products */}
          {loading ? (
            <div className="list-loading">
              <span className="loading-spinner" />
              <span>正在请求模拟商品接口...</span>
            </div>
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">🔍</span>
              <p>暂无该分类商品</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ProductList;
