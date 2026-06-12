import {
  buildTraceability,
  mockAccounts,
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
  mockSellerApplications,
  mockUser,
  mockUserAsset,
} from '../data/mockData';
import type { Address, CartItem, MockAccount, Order, Product, SellerApplication, User } from '../types';

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

interface AdminProductInput {
  name: string;
  price: number;
  stock: number;
  unit: string;
  origin: string;
  categoryId: number;
  description?: string;
}

// ============ 多用户账户（localStorage 持久化，内置账户始终可用） ============
const USERS_STORAGE_KEY = 'freshwild-mock-users';

const loadAccounts = (): MockAccount[] => {
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as MockAccount[];
      // 旧版本存储可能缺少新增字段（如 sellerId），用内置账户回填
      const merged = stored.map((account) => {
        const preset = mockAccounts.find((item) => item.username === account.username);
        if (!preset) return account;
        return {
          ...account,
          sellerId: account.sellerId ?? preset.sellerId,
          shopName: account.shopName ?? preset.shopName,
        };
      });
      mockAccounts.forEach((preset) => {
        if (!merged.some((account) => account.username === preset.username)) {
          merged.push(structuredClone(preset));
        }
      });
      return merged;
    }
  } catch {
    // 本地数据损坏时回退到内置账户
  }
  return structuredClone(mockAccounts);
};

let accounts = loadAccounts();

const saveAccounts = () => {
  try {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // 存储不可用时仅保留内存状态
  }
};

const toPublicUser = (account: MockAccount): User => ({
  id: account.id,
  username: account.username,
  phone: account.phone,
  avatar: account.avatar,
  role: account.role,
  status: account.status,
  createdAt: account.createdAt,
  sellerId: account.sellerId,
  shopName: account.shopName,
});

// ============ 入驻申请（localStorage 持久化） ============
const APPS_STORAGE_KEY = 'freshwild-seller-apps';

const loadApplications = (): SellerApplication[] => {
  try {
    const raw = window.localStorage.getItem(APPS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SellerApplication[];
  } catch {
    // 本地数据损坏时回退到内置申请
  }
  return structuredClone(mockSellerApplications);
};

let sellerApplications = loadApplications();

const saveApplications = () => {
  try {
    window.localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(sellerApplications));
  } catch {
    // 存储不可用时仅保留内存状态
  }
};

// ============ API 级权限校验 ============
const requireAdmin = () => {
  if (currentUser.role !== 'ADMIN') throw new Error('权限不足：该操作仅平台管理员可执行');
};

const requireSeller = (): { sellerId: number; shopName: string } => {
  if (currentUser.role !== 'SELLER' || !currentUser.sellerId) {
    throw new Error('权限不足：该操作仅入驻商家可执行');
  }
  return { sellerId: currentUser.sellerId, shopName: currentUser.shopName ?? currentUser.username };
};

let products: Product[] = structuredClone(mockProducts);
let cartItems: CartItem[] = structuredClone(mockCartItems);
let orders: Order[] = structuredClone(mockOrders);
let currentUser: User = structuredClone(mockUser);
let notifications = structuredClone(mockNotifications);
let addresses = structuredClone(mockAddresses);

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
  // 页面刷新后由 authStore 回灌已登录用户，保持模拟会话一致
  syncCurrentUser(user: User) {
    currentUser = structuredClone(user);
  },

  async getHomeData() {
    await wait();
    const hotProducts = sortProducts(products, 'sales').slice(0, 4);
    const freshProducts = products.filter((product) => product.tags.includes('新鲜')).slice(0, 4);
    const recommendProducts = products.slice(0, 8);

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
    let list = [...products];

    if (query.categoryId) {
      list = list.filter((product) => product.categoryId === query.categoryId);
    }

    if (keyword) {
      list = list.filter((product) =>
        [product.name, product.origin, product.categoryName, product.sellerName, ...product.tags]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      );
    }

    if (query.stockOnly) {
      list = list.filter((product) => product.stock > 0);
    }

    return clone({
      products: sortProducts(list, query.sortBy ?? 'default'),
      categories: mockCategories,
      total: list.length,
      updatedAt: '2026-06-02 10:30',
    });
  },

  async getProductDetail(productId: number) {
    await wait();
    const product = products.find((item) => item.id === productId);

    if (!product) {
      return clone({ product: null, related: [], reviews: [], traceability: null });
    }

    return clone({
      product,
      related: products
        .filter((item) => item.categoryId === product.categoryId && item.id !== product.id)
        .slice(0, 4),
      reviews: mockReviews.filter((review) => review.productId === product.id),
      traceability: buildTraceability(product),
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
    const product = products.find((item) => item.id === productId);
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
    const product = products.find((item) => item.id === productId);
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
    const username = payload.username.trim();
    if (!username || !payload.password.trim()) {
      throw new Error('请输入用户名和密码');
    }

    const account = accounts.find((item) => item.username === username);
    if (!account) throw new Error('账号不存在，请先注册');
    if (account.password !== payload.password) throw new Error('密码错误，请重试');
    if (account.status === 'DISABLED') throw new Error('该账号已被禁用，请联系平台客服');

    currentUser = toPublicUser(account);
    return clone(currentUser);
  },

  async register(payload: RegisterPayload) {
    await wait(680);
    const username = payload.username.trim();
    if (username.length < 2) throw new Error('用户名至少需要 2 个字符');
    if (payload.password.length < 6) throw new Error('密码至少需要 6 位');
    if (!/^1\d{10}$/.test(payload.phone.trim())) throw new Error('请输入正确的 11 位手机号');
    if (accounts.some((item) => item.username === username)) {
      throw new Error('用户名已存在，请直接登录');
    }

    const newAccount: MockAccount = {
      id: Math.max(0, ...accounts.map((item) => item.id)) + 1,
      username,
      password: payload.password,
      phone: payload.phone.trim(),
      avatar: '',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: new Date().toLocaleDateString('zh-CN'),
    };
    accounts = [...accounts, newAccount];
    saveAccounts();

    currentUser = toPublicUser(newAccount);
    return clone(currentUser);
  },

  async getProfileData() {
    await wait();
    return clone({
      user: currentUser,
      asset: mockUserAsset,
      addresses,
      coupons: mockCoupons,
      notifications,
      recentOrders: orders.slice(0, 3),
      stats: orderStats(),
    });
  },

  async markNotificationRead(id: number) {
    await wait(200);
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    return clone(notifications);
  },

  async markAllNotificationsRead() {
    await wait(300);
    notifications = notifications.map((n) => ({ ...n, read: true }));
    return clone(notifications);
  },

  async addAddress(address: Omit<Address, 'id'>) {
    await wait(400);
    const newAddress = { ...address, id: Math.max(0, ...addresses.map((a) => a.id)) + 1 };
    addresses = [...addresses, newAddress];
    return clone(addresses);
  },

  async updateAddress(id: number, address: Partial<Address>) {
    await wait(400);
    addresses = addresses.map((a) => (a.id === id ? { ...a, ...address } : a));
    return clone(addresses);
  },

  async deleteAddress(id: number) {
    await wait(300);
    addresses = addresses.filter((a) => a.id !== id);
    return clone(addresses);
  },

  async setDefaultAddress(id: number) {
    await wait(200);
    addresses = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    return clone(addresses);
  },

  // ============ 管理端接口 ============
  async getAdminStats() {
    await wait(420);
    requireAdmin();
    const validOrders = orders.filter((order) => order.status !== 'CANCELLED');
    const totalSales = Number(validOrders.reduce((sum, order) => sum + order.payAmount, 0).toFixed(2));
    const soldOut = products.filter((product) => product.stock === 0);
    const lowStock = products.filter((product) => product.stock > 0 && product.stock < 60);

    return clone({
      totalSales,
      orderCount: orders.length,
      userCount: accounts.length,
      productCount: products.length,
      lowStockCount: soldOut.length + lowStock.length,
      cancelledCount: orders.filter((order) => order.status === 'CANCELLED').length,
      orderStats: orderStats(),
      topProducts: sortProducts(products, 'sales').slice(0, 5),
      lowStockProducts: [...soldOut, ...lowStock].slice(0, 5),
      recentOrders: orders.slice(0, 6),
    });
  },

  async getAdminProducts(query: { keyword?: string; categoryId?: number | null } = {}) {
    await wait(360);
    requireAdmin();
    const keyword = query.keyword?.trim().toLowerCase();
    let list = [...products];

    if (query.categoryId) {
      list = list.filter((product) => product.categoryId === query.categoryId);
    }
    if (keyword) {
      list = list.filter((product) =>
        [product.name, product.origin, product.sellerName].join(' ').toLowerCase().includes(keyword)
      );
    }

    return clone({ products: list, categories: mockCategories, total: list.length });
  },

  async updateProduct(id: number, patch: Partial<Pick<Product, 'name' | 'price' | 'originalPrice' | 'stock'>>) {
    await wait(380);
    requireAdmin();
    const target = products.find((product) => product.id === id);
    if (!target) throw new Error('商品不存在');
    if (patch.price !== undefined && patch.price <= 0) throw new Error('价格必须大于 0');
    if (patch.stock !== undefined && patch.stock < 0) throw new Error('库存不能为负数');

    Object.assign(target, patch);
    return clone(target);
  },

  async deleteProduct(id: number) {
    await wait(380);
    requireAdmin();
    products = products.filter((product) => product.id !== id);
    cartItems = cartItems.filter((item) => item.product.id !== id);
    return clone({ total: products.length });
  },

  async addProduct(input: AdminProductInput) {
    await wait(480);
    requireAdmin();
    if (!input.name.trim()) throw new Error('请填写商品名称');
    if (!(input.price > 0)) throw new Error('价格必须大于 0');
    if (input.stock < 0) throw new Error('库存不能为负数');

    const category = mockCategories.find((item) => item.id === input.categoryId);
    if (!category) throw new Error('请选择商品分类');

    const newProduct: Product = {
      id: Math.max(0, ...products.map((product) => product.id)) + 1,
      name: input.name.trim(),
      price: Number(input.price.toFixed(1)),
      unit: input.unit.trim() || '份',
      origin: input.origin.trim() || '待补充',
      coverImage: '',
      images: [],
      description: input.description?.trim() || '管理后台新增商品，描述待完善。',
      categoryId: category.id,
      categoryName: category.name,
      sales: 0,
      stock: Math.floor(input.stock),
      tags: ['新品'],
      sellerId: 999,
      sellerName: '平台自营',
    };

    products = [newProduct, ...products];
    return clone(newProduct);
  },

  async getAdminOrders(status: OrderFilter = 'ALL') {
    await wait(360);
    requireAdmin();
    const list = status === 'ALL' ? orders : orders.filter((order) => order.status === status);
    return clone({ orders: list, stats: orderStats(), total: list.length });
  },

  async adminUpdateOrder(orderId: number, action: 'ship' | 'cancel' | 'complete') {
    await wait(440);
    requireAdmin();
    orders = orders.map((order) => {
      if (order.id !== orderId) return order;
      if (action === 'ship') return { ...order, status: 'SHIPPED' as const };
      if (action === 'cancel') return { ...order, status: 'CANCELLED' as const };
      return { ...order, status: 'COMPLETED' as const };
    });
    return clone({ orders, stats: orderStats() });
  },

  async getAdminUsers(keyword = '') {
    await wait(320);
    requireAdmin();
    const kw = keyword.trim().toLowerCase();
    const list = kw
      ? accounts.filter((account) => [account.username, account.phone].join(' ').toLowerCase().includes(kw))
      : accounts;
    return clone(list.map(toPublicUser));
  },

  async toggleUserStatus(id: number) {
    await wait(320);
    requireAdmin();
    const target = accounts.find((account) => account.id === id);
    if (!target) throw new Error('用户不存在');
    if (target.username === currentUser.username) throw new Error('不能禁用当前登录的账号');

    target.status = target.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
    saveAccounts();
    return clone(accounts.map(toPublicUser));
  },

  async updateUserRole(id: number, role: User['role']) {
    await wait(320);
    requireAdmin();
    const target = accounts.find((account) => account.id === id);
    if (!target) throw new Error('用户不存在');
    if (target.username === currentUser.username) throw new Error('不能修改当前登录账号的角色');

    target.role = role;
    saveAccounts();
    return clone(accounts.map(toPublicUser));
  },

  // ============ 商家端接口（仅操作本店数据） ============
  async getSellerStats() {
    await wait(420);
    const { sellerId, shopName } = requireSeller();
    const own = products.filter((product) => product.sellerId === sellerId);
    const ownIds = new Set(own.map((product) => product.id));
    const ownOrders = orders.filter((order) => order.items.some((item) => ownIds.has(item.productId)));
    const revenue = ownOrders
      .filter((order) => order.status !== 'CANCELLED')
      .reduce(
        (sum, order) =>
          sum +
          order.items
            .filter((item) => ownIds.has(item.productId))
            .reduce((subtotal, item) => subtotal + item.subtotal, 0),
        0
      );

    return clone({
      shopName,
      productCount: own.length,
      totalSales: own.reduce((sum, product) => sum + product.sales, 0),
      revenue: Number(revenue.toFixed(2)),
      orderCount: ownOrders.length,
      pendingShipCount: ownOrders.filter((order) => order.status === 'PAID').length,
      topProducts: sortProducts(own, 'sales').slice(0, 5),
      lowStockProducts: own.filter((product) => product.stock < 60).slice(0, 5),
      recentOrders: ownOrders.slice(0, 6),
    });
  },

  async getSellerProducts(query: { keyword?: string } = {}) {
    await wait(360);
    const { sellerId } = requireSeller();
    const keyword = query.keyword?.trim().toLowerCase();
    let list = products.filter((product) => product.sellerId === sellerId);

    if (keyword) {
      list = list.filter((product) =>
        [product.name, product.origin].join(' ').toLowerCase().includes(keyword)
      );
    }

    return clone({ products: list, categories: mockCategories, total: list.length });
  },

  async sellerUpdateProduct(id: number, patch: Partial<Pick<Product, 'price' | 'stock'>>) {
    await wait(380);
    const { sellerId } = requireSeller();
    const target = products.find((product) => product.id === id);
    if (!target) throw new Error('商品不存在');
    if (target.sellerId !== sellerId) throw new Error('无权操作其他店铺的商品');
    if (patch.price !== undefined && patch.price <= 0) throw new Error('价格必须大于 0');
    if (patch.stock !== undefined && patch.stock < 0) throw new Error('库存不能为负数');

    Object.assign(target, patch);
    return clone(target);
  },

  async sellerDeleteProduct(id: number) {
    await wait(380);
    const { sellerId } = requireSeller();
    const target = products.find((product) => product.id === id);
    if (!target) throw new Error('商品不存在');
    if (target.sellerId !== sellerId) throw new Error('无权操作其他店铺的商品');

    products = products.filter((product) => product.id !== id);
    cartItems = cartItems.filter((item) => item.product.id !== id);
    return clone({ total: products.filter((product) => product.sellerId === sellerId).length });
  },

  async sellerAddProduct(input: AdminProductInput) {
    await wait(480);
    const { sellerId, shopName } = requireSeller();
    if (!input.name.trim()) throw new Error('请填写商品名称');
    if (!(input.price > 0)) throw new Error('价格必须大于 0');
    if (input.stock < 0) throw new Error('库存不能为负数');

    const category = mockCategories.find((item) => item.id === input.categoryId);
    if (!category) throw new Error('请选择商品分类');

    const newProduct: Product = {
      id: Math.max(0, ...products.map((product) => product.id)) + 1,
      name: input.name.trim(),
      price: Number(input.price.toFixed(1)),
      unit: input.unit.trim() || '份',
      origin: input.origin.trim() || '待补充',
      coverImage: '',
      images: [],
      description: input.description?.trim() || '商家新增商品，描述待完善。',
      categoryId: category.id,
      categoryName: category.name,
      sales: 0,
      stock: Math.floor(input.stock),
      tags: ['新品'],
      sellerId,
      sellerName: shopName,
    };

    products = [newProduct, ...products];
    return clone(newProduct);
  },

  async getSellerOrders(status: OrderFilter = 'ALL') {
    await wait(360);
    const { sellerId } = requireSeller();
    const ownIds = new Set(products.filter((product) => product.sellerId === sellerId).map((p) => p.id));

    const ownOrders = orders
      .filter((order) => order.items.some((item) => ownIds.has(item.productId)))
      .filter((order) => status === 'ALL' || order.status === status)
      .map((order) => {
        const ownItems = order.items.filter((item) => ownIds.has(item.productId));
        return {
          ...order,
          items: ownItems,
          sellerSubtotal: Number(ownItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)),
        };
      });

    return clone({ orders: ownOrders, total: ownOrders.length });
  },

  async sellerShipOrder(orderId: number) {
    await wait(440);
    const { sellerId } = requireSeller();
    const ownIds = new Set(products.filter((product) => product.sellerId === sellerId).map((p) => p.id));
    const target = orders.find((order) => order.id === orderId);

    if (!target) throw new Error('订单不存在');
    if (!target.items.some((item) => ownIds.has(item.productId))) {
      throw new Error('无权操作其他店铺的订单');
    }
    if (target.status !== 'PAID') throw new Error('仅待发货状态的订单可以发货');

    orders = orders.map((order) => (order.id === orderId ? { ...order, status: 'SHIPPED' as const } : order));
    return clone({ success: true });
  },

  // ============ 商家入驻申请 ============
  async submitSellerApplication(input: {
    shopName: string;
    contactPhone: string;
    mainCategory: string;
    description: string;
  }) {
    await wait(560);
    if (currentUser.role === 'SELLER') throw new Error('您已是入驻商家，无需重复申请');
    if (currentUser.role === 'ADMIN') throw new Error('管理员账号无需入驻');
    if (!input.shopName.trim()) throw new Error('请填写店铺名称');
    if (!/^1\d{10}$/.test(input.contactPhone.trim())) throw new Error('请输入正确的 11 位联系电话');
    if (!input.description.trim()) throw new Error('请简单介绍主营业务与货源情况');

    if (sellerApplications.some((app) => app.userId === currentUser.id && app.status === 'PENDING')) {
      throw new Error('您已有一份待审核的入驻申请，请耐心等待');
    }

    const application: SellerApplication = {
      id: Math.max(0, ...sellerApplications.map((app) => app.id)) + 1,
      userId: currentUser.id,
      username: currentUser.username,
      shopName: input.shopName.trim(),
      contactPhone: input.contactPhone.trim(),
      mainCategory: input.mainCategory.trim() || '综合农产品',
      description: input.description.trim(),
      status: 'PENDING',
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    };

    sellerApplications = [application, ...sellerApplications];
    saveApplications();
    return clone(application);
  },

  async getMyApplication() {
    await wait(300);
    return clone(sellerApplications.find((app) => app.userId === currentUser.id) ?? null);
  },

  async getSellerApplications() {
    await wait(360);
    requireAdmin();
    return clone(sellerApplications);
  },

  async reviewSellerApplication(id: number, approve: boolean, rejectReason?: string) {
    await wait(480);
    requireAdmin();
    const application = sellerApplications.find((app) => app.id === id);
    if (!application) throw new Error('申请不存在');
    if (application.status !== 'PENDING') throw new Error('该申请已处理过');

    application.status = approve ? 'APPROVED' : 'REJECTED';
    application.reviewedAt = new Date().toLocaleString('zh-CN', { hour12: false });
    if (!approve) application.rejectReason = rejectReason?.trim() || '未通过平台审核';

    if (approve) {
      const account = accounts.find((item) => item.id === application.userId);
      if (account) {
        const nextSellerId =
          Math.max(0, ...accounts.map((item) => item.sellerId ?? 0), ...products.map((p) => p.sellerId)) + 1;
        account.role = 'SELLER';
        account.sellerId = nextSellerId;
        account.shopName = application.shopName;
        saveAccounts();
      }
    }

    saveApplications();
    return clone(sellerApplications);
  },
};
