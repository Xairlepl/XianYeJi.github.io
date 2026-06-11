// 商品类型
export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  origin: string;
  coverImage: string;
  images: string[];
  description: string;
  categoryId: number;
  categoryName: string;
  sales: number;
  stock: number;
  tags: string[];
  sellerId: number;
  sellerName: string;
}

// 商品分类
export interface Category {
  id: number;
  name: string;
  icon: string;
  parentId: number;
}

// 购物车项
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  checked: boolean;
}

// 订单
export interface Order {
  id: number;
  orderNo: string;
  totalAmount: number;
  payAmount: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'RECEIVED' | 'COMPLETED' | 'CANCELLED';
  items: OrderItem[];
  address: Address;
  createdAt: string;
  remark?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

// 收货地址
export interface Address {
  id: number;
  receiver: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

// 用户
export interface User {
  id: number;
  username: string;
  phone: string;
  avatar: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
}

// 会员资产
export interface UserAsset {
  points: number;
  balance: number;
  coupons: number;
  favorites: number;
}

// 优惠券
export interface Coupon {
  id: number;
  title: string;
  threshold: number;
  amount: number;
  expireAt: string;
  status: 'AVAILABLE' | 'USED' | 'EXPIRED';
}

// 消息通知
export interface Notification {
  id: number;
  title: string;
  content: string;
  type: 'ORDER' | 'PROMOTION' | 'SYSTEM';
  read: boolean;
  createdAt: string;
}

// 产地故事
export interface FarmStory {
  id: number;
  title: string;
  location: string;
  image: string;
  summary: string;
  tags: string[];
}

// 商品评价
export interface ProductReview {
  id: number;
  productId: number;
  username: string;
  rating: number;
  content: string;
  createdAt: string;
}

// 轮播
export interface Banner {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  link: string;
  gradient: string;
}
