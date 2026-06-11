import {
  mockAddresses,
  mockBanners,
  mockCartItems,
  mockCategories,
  mockCoupons,
  mockFarmStories,
  mockNotifications,
  mockOrders,
  mockProducts,
  mockReviews,
  mockUser,
  mockUserAsset,
} from '../data/mockData';
import type { CartItem, Order, Product, User } from '../types';

export type ProductSort = 'default' | 'price-asc' | 'price-desc' | 'sales';
export type OrderFilter = 'ALL' | Order['status'];

interface ProductQuery {
  categoryId?: number | null;
  keyword?: string;
  sortBy?: ProductSort;
  stockOnly?: boolean;
}

interface LoginPayload {
  username: string;
  password: string;
}

interface RegisterPayload extends LoginPayload {
  phone: string;
}

let cartItems: CartItem[] = structuredClone(mockCartItems);
let orders: Order[] = structuredClone(mockOrders);
let currentUser: User = structuredClone(mockUser);

const wait = async (ms = 420) => {
  await new Promise((resolve) => window.setTimeout(resolve, ms));
};

const clone = <T>(data: T): T => structuredClone(data);

const makeOrderNo = () => {
  const time = new Date();
  const stamp = [
    time.getFullYear(),
    String(time.getMonth() + 1).padStart(2, '0'),
    String(time.getDate()).padStart(2, '0'),
    String(time.getHours()).padStart(2, '0'),
    String(time.getMinutes()).padStart(2, '0'),
    String(time.getSeconds()).padStart(2, '0'),
  ].join('');
  return `LY${stamp}${String(orders.length + 1).padStart(3, '0')}`;
};

const toOrderItem = (product: Product, quantity: number, id: number) => ({
  id,
  productId: product.id,
  productName: product.name,
  productImage: product.coverImage,
  price: product.price,
  quantity,
  subtotal: Number((product.price * quantity).toFixed(2)),
});

const sortProducts = (products: Product[], sortBy: ProductSort) => {
  if (sortBy === 'price-asc') return [...products].sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') return [...products].sort((a, b) => b.price - a.price);
  if (sortBy === 'sales') return [...products].sort((a, b) => b.sales - a.sales);
  return products;
};

const orderStats = () => ({
  PENDING: orders.filter((order) => order.status === 'PENDING').length,
  PAID: orders.filter((order) => order.status === 'PAID').length,
  SHIPPED: orders.filter((order) => order.status === 'SHIPPED').length,
  COMPLETED: orders.filter((order) => order.status === 'COMPLETED').length,
});

export const mockApi = {
  async getHomeData() {
    await wait();
    const hotProducts = sortProducts(mockProducts, 'sales').slice(0, 4);
    const freshProducts = mockProducts.filter((product) => product.tags.includes('新鲜')).slice(0, 4);
    const recommendProducts = mockProducts.slice(0, 8);

    return clone({
      banners: mockBanners,
      categories: mockCategories,
      hotProducts,
      freshProducts,
      recommendProducts,
      farmStories: mockFarmStories,
      platformStats: [
        { label: '合作产地', value: '86+' },
        { label: '当日可发商品', value: '1,280+' },
        { label: '冷链覆盖城市', value: '214' },
        { label: '好评率', value: '98.6%' },
      ],
    });
  },

  async getProducts(query: ProductQuery = {}) {
    await wait(360);
    const keyword = query.keyword?.trim().toLowerCase();
    let products = [...mockProducts];

    if (query.categoryId) {
      products = products.filter((product) => product.categoryId === query.categoryId);
    }

    if (keyword) {
      products = products.filter((product) =>
        [product.name, product.origin, product.categoryName, product.sellerName, ...product.tags]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      );
    }

    if (query.stockOnly) {
      products = products.filter((product) => product.stock > 0);
    }

    return clone({
      products: sortProducts(products, query.sortBy ?? 'default'),
      categories: mockCategories,
      total: products.length,
      updatedAt: '2026-06-02 10:30',
    });
  },

  async getProductDetail(productId: number) {
    await wait();
    const product = mockProducts.find((item) => item.id === productId);

    if (!product) {
      return clone({ product: null, related: [], reviews: [] });
    }

    return clone({
      product,
      related: mockProducts
        .filter((item) => item.categoryId === product.categoryId && item.id !== product.id)
        .slice(0, 4),
      reviews: mockReviews.filter((review) => review.productId === product.id),
    });
  },

  async getCart() {
    await wait(320);
    return clone(cartItems);
  },

  async getCartSummary() {
    await wait(180);
    return clone({
      count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      checkedCount: cartItems.filter((item) => item.checked).length,
    });
  },

  async addToCart(productId: number, quantity: number) {
    await wait();
    const product = mockProducts.find((item) => item.id === productId);
    if (!product) throw new Error('商品不存在');
    if (quantity > product.stock) throw new Error('库存不足');

    const existing = cartItems.find((item) => item.product.id === productId);
    if (existing) {
      existing.quantity = Math.min(product.stock, existing.quantity + quantity);
      existing.checked = true;
    } else {
      cartItems = [
        ...cartItems,
        {
          id: Math.max(0, ...cartItems.map((item) => item.id)) + 1,
          product,
          quantity,
          checked: true,
        },
      ];
    }

    return clone(cartItems);
  },

  async updateCartItem(id: number, quantity: number) {
    await wait(260);
    cartItems = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, Math.min(item.product.stock, quantity)) } : item
    );
    return clone(cartItems);
  },

  async toggleCartItem(id: number, checked: boolean) {
    await wait(180);
    cartItems = cartItems.map((item) => (item.id === id ? { ...item, checked } : item));
    return clone(cartItems);
  },

  async toggleAllCartItems(checked: boolean) {
    await wait(180);
    cartItems = cartItems.map((item) => ({ ...item, checked }));
    return clone(cartItems);
  },

  async removeCartItem(id: number) {
    await wait(260);
    cartItems = cartItems.filter((item) => item.id !== id);
    return clone(cartItems);
  },

  async checkoutCart(itemIds: number[]) {
    await wait(620);
    const selectedItems = cartItems.filter((item) => itemIds.includes(item.id));
    if (selectedItems.length === 0) throw new Error('请选择要结算的商品');

    const orderItems = selectedItems.map((item, index) =>
      toOrderItem(item.product, item.quantity, orders.length + index + 10)
    );
    const totalAmount = Number(orderItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
    const newOrder: Order = {
      id: Math.max(0, ...orders.map((order) => order.id)) + 1,
      orderNo: makeOrderNo(),
      totalAmount,
      payAmount: totalAmount,
      status: 'PENDING',
      items: orderItems,
      address: mockAddresses[0],
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      remark: '模拟结算生成订单',
    };

    orders = [newOrder, ...orders];
    cartItems = cartItems.filter((item) => !itemIds.includes(item.id));
    return clone({ order: newOrder, cartItems });
  },

  async buyNow(productId: number, quantity: number) {
    await wait(620);
    const product = mockProducts.find((item) => item.id === productId);
    if (!product) throw new Error('商品不存在');
    if (quantity > product.stock) throw new Error('库存不足');

    const orderItem = toOrderItem(product, quantity, orders.length + 10);
    const totalAmount = Number(orderItem.subtotal.toFixed(2));
    const newOrder: Order = {
      id: Math.max(0, ...orders.map((order) => order.id)) + 1,
      orderNo: makeOrderNo(),
      totalAmount,
      payAmount: totalAmount,
      status: 'PENDING',
      items: [orderItem],
      address: mockAddresses[0],
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      remark: '模拟立即购买生成订单',
    };

    orders = [newOrder, ...orders];
    return clone(newOrder);
  },

  async getOrders(status: OrderFilter = 'ALL') {
    await wait();
    const filteredOrders = status === 'ALL' ? orders : orders.filter((order) => order.status === status);
    return clone({ orders: filteredOrders, stats: orderStats() });
  },

  async updateOrder(orderId: number, action: 'pay' | 'cancel' | 'receive') {
    await wait(520);
    orders = orders.map((order) => {
      if (order.id !== orderId) return order;
      if (action === 'pay') return { ...order, status: 'PAID' };
      if (action === 'cancel') return { ...order, status: 'CANCELLED' };
      return { ...order, status: 'COMPLETED' };
    });
    return clone({ orders, stats: orderStats() });
  },

  async login(payload: LoginPayload) {
    await wait(560);
    if (!payload.username.trim() || !payload.password.trim()) {
      throw new Error('请输入用户名和密码');
    }
    currentUser = { ...currentUser, username: payload.username.trim() };
    return clone(currentUser);
  },

  async register(payload: RegisterPayload) {
    await wait(680);
    if (payload.password.length < 6) throw new Error('密码至少需要 6 位');
    currentUser = {
      ...currentUser,
      username: payload.username.trim(),
      phone: payload.phone.trim(),
    };
    return clone(currentUser);
  },

  async getProfileData() {
    await wait();
    return clone({
      user: currentUser,
      asset: mockUserAsset,
      addresses: mockAddresses,
      coupons: mockCoupons,
      notifications: mockNotifications,
      recentOrders: orders.slice(0, 3),
      stats: orderStats(),
    });
  },
};
