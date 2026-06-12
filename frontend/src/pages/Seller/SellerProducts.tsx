import { useCallback, useEffect, useState } from 'react';
import { Package, Search, PlusCircle, Save, Trash2, X } from 'lucide-react';
import { mockApi } from '@/services/mockApi';
import { useToastStore } from '@/store/toastStore';
import { setProductImageFallback } from '@/utils/imageFallback';
import type { Category, Product } from '@/types';

interface Draft {
  price: string;
  stock: string;
}

const emptyForm = {
  name: '',
  price: '',
  stock: '',
  unit: '份',
  origin: '',
  categoryId: '1',
  description: '',
};

const SellerProducts = () => {
  const showToast = useToastStore((state) => state.show);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = useCallback(async () => {
    const data = await mockApi.getSellerProducts({ keyword });
    setProducts(data.products);
    setCategories(data.categories);
    setLoading(false);
  }, [keyword]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      loadProducts();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [loadProducts]);

  const getDraftFrom = (state: Record<number, Draft>, id: number, product: Product): Draft =>
    state[id] ?? { price: String(product.price), stock: String(product.stock) };

  const getDraft = (product: Product): Draft => getDraftFrom(drafts, product.id, product);

  const setDraft = (id: number, patch: Partial<Draft>, product: Product) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...getDraftFrom(prev, id, product), ...patch } }));
  };

  const isDirty = (product: Product) => {
    const draft = drafts[product.id];
    if (!draft) return false;
    return Number(draft.price) !== product.price || Number(draft.stock) !== product.stock;
  };

  const handleSave = async (product: Product) => {
    const draft = getDraft(product);
    const price = Number(draft.price);
    const stock = Number(draft.stock);

    if (!Number.isFinite(price) || price <= 0) {
      showToast('请输入有效的价格', 'error');
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      showToast('库存必须是不小于 0 的整数', 'error');
      return;
    }

    setPendingId(product.id);
    try {
      await mockApi.sellerUpdateProduct(product.id, { price, stock });
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      await loadProducts();
      showToast(`已更新「${product.name}」`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '保存失败', 'error');
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`确认下架并删除商品「${product.name}」？`)) return;
    setPendingId(product.id);
    try {
      await mockApi.sellerDeleteProduct(product.id);
      await loadProducts();
      showToast('商品已删除', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '删除失败', 'error');
    } finally {
      setPendingId(null);
    }
  };

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await mockApi.sellerAddProduct({
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock || 0),
        unit: form.unit,
        origin: form.origin,
        categoryId: Number(form.categoryId),
        description: form.description,
      });
      setForm(emptyForm);
      setShowForm(false);
      await loadProducts();
      showToast('新商品已上架', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '新增失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="seller-products" id="seller-products">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            <Package size={22} />
            我的商品
          </h1>
          <p className="admin-page-desc">仅展示本店铺商品，价格与库存可直接修改后保存</p>
        </div>
        <button className="btn btn-accent" onClick={() => setShowForm((open) => !open)}>
          {showForm ? <X size={16} /> : <PlusCircle size={16} />}
          {showForm ? '收起表单' : '上架新品'}
        </button>
      </div>

      {showForm && (
        <form className="admin-panel" onSubmit={handleAdd}>
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">
              <PlusCircle size={18} />
              上架新品
            </h2>
          </div>
          <div className="admin-form-grid">
            <div className="admin-form-field">
              <label htmlFor="seller-new-name">商品名称 *</label>
              <input
                id="seller-new-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="如：现摘水蜜桃 5斤"
                required
              />
            </div>
            <div className="admin-form-field">
              <label htmlFor="seller-new-price">售价（元）*</label>
              <input
                id="seller-new-price"
                type="number"
                min="0.1"
                step="0.1"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-field">
              <label htmlFor="seller-new-stock">库存</label>
              <input
                id="seller-new-stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="admin-form-field">
              <label htmlFor="seller-new-unit">计量单位</label>
              <input
                id="seller-new-unit"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="箱 / 斤 / 盒"
              />
            </div>
            <div className="admin-form-field">
              <label htmlFor="seller-new-origin">产地</label>
              <input
                id="seller-new-origin"
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
                placeholder="如：山东烟台"
              />
            </div>
            <div className="admin-form-field">
              <label htmlFor="seller-new-category">商品分类 *</label>
              <select
                id="seller-new-category"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-form-field span-3">
              <label htmlFor="seller-new-desc">商品描述</label>
              <textarea
                id="seller-new-desc"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="选填，建议包含口感、规格、储存方式等信息"
              />
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              取消
            </button>
            <button type="submit" className="btn btn-accent" disabled={submitting}>
              <Save size={16} />
              {submitting ? '提交中...' : '确认上架'}
            </button>
          </div>
        </form>
      )}

      <div className="admin-filter-bar">
        <div className="admin-search">
          <Search size={16} />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索本店商品名称 / 产地"
          />
        </div>
        <span className="admin-filter-count">共 {products.length} 件商品</span>
      </div>

      <div className="admin-panel">
        {loading ? (
          <div className="admin-loading">
            <span className="loading-spinner" />
            <span>正在加载商品...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="admin-empty">店铺暂无商品，点击右上角「上架新品」开始经营</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>商品</th>
                  <th>分类</th>
                  <th>售价（元）</th>
                  <th>库存</th>
                  <th>销量</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const draft = getDraft(product);
                  const busy = pendingId !== null;
                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-table-product">
                          <img
                            src={product.coverImage}
                            alt={product.name}
                            onError={(event) => setProductImageFallback(event, product.name)}
                          />
                          <div>
                            <span className="name">{product.name}</span>
                            <small>{product.origin}</small>
                          </div>
                        </div>
                      </td>
                      <td>{product.categoryName}</td>
                      <td>
                        <input
                          className="admin-inline-input"
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={draft.price}
                          onChange={(e) => setDraft(product.id, { price: e.target.value }, product)}
                          disabled={busy}
                        />
                      </td>
                      <td>
                        <input
                          className="admin-inline-input"
                          type="number"
                          min="0"
                          step="1"
                          value={draft.stock}
                          onChange={(e) => setDraft(product.id, { stock: e.target.value }, product)}
                          disabled={busy}
                        />
                      </td>
                      <td>{product.sales}</td>
                      <td>
                        {product.stock === 0 ? (
                          <span className="status-pill" style={{ background: '#c83f321a', color: 'var(--color-error)' }}>
                            已售罄
                          </span>
                        ) : product.stock < 60 ? (
                          <span className="status-pill" style={{ background: '#d98a161a', color: 'var(--color-warning)' }}>
                            库存偏低
                          </span>
                        ) : (
                          <span className="status-pill" style={{ background: '#2f8f3a1a', color: 'var(--color-success)' }}>
                            在售
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            className="btn btn-accent btn-sm"
                            onClick={() => handleSave(product)}
                            disabled={busy || !isDirty(product)}
                          >
                            <Save size={14} />
                            {pendingId === product.id ? '...' : '保存'}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDelete(product)}
                            disabled={busy}
                          >
                            <Trash2 size={14} />
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProducts;
