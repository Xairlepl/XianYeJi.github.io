# 🌾 鲜野集 - 原生态农产品电商演示前端

基于 **React 19 + TypeScript + Vite** 的现代化农产品电商单页应用。

> **项目根目录有完整文档，请参考 [../README.md](../README.md)**

## ✨ 技术栈

- **React 19.2** + **TypeScript 6.0** + **Vite 8.0**
- **Zustand 5.0** (状态管理)
- **React Router 7.15** (路由)
- **纯 CSS** (自定义设计系统)

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 开发服务器 (http://localhost:5173)
npm run dev

# 生产构建
npm run build

# 预览构建
npm run preview

# 代码检查
npm run lint
```

## 📦 项目结构

```
src/
├── components/
│   ├── common/              # Toast, ErrorBoundary, AIChat
│   ├── Header/Footer/       # 页头页脚
│   └── ProductCard/         # 商品卡片
├── pages/                   # 11 个页面组件
│   ├── Home/                # 首页
│   ├── ProductList/         # 商品列表
│   ├── ProductDetail/       # 商品详情
│   ├── Cart/                # 购物车
│   ├── Orders/              # 订单列表
│   ├── Profile/             # 个人中心
│   ├── Login/               # 登录注册
│   ├── Addresses/           # 收货地址
│   ├── Favorites/           # 我的收藏
│   ├── Coupons/             # 优惠券
│   ├── Notifications/       # 消息通知
│   └── NotFound/            # 404
├── store/                   # 4 个 Zustand Store
│   ├── cartStore.ts         # 购物车
│   ├── authStore.ts         # 认证
│   ├── favoriteStore.ts     # 收藏
│   └── toastStore.ts        # 通知
├── services/
│   ├── mockApi.ts           # Mock API (350行)
│   └── chatService.ts       # AI 客服引擎
├── data/
│   └── mockData.ts          # Mock 数据 (738行)
├── types/
│   └── index.ts             # TypeScript 类型定义
├── utils/
│   ├── format.ts            # 格式化工具
│   └── imageFallback.ts     # 图片 fallback
├── hooks/
│   └── useAsync.ts          # 异步 hook
├── App.tsx                  # 根组件
├── main.tsx                 # 入口
└── index.css                # 全局样式 + Design System
```

## 🎯 核心功能

### 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 轮播、分类、热销商品、产地溯源 |
| `/products` | 商品列表 | 分类筛选、排序、搜索 |
| `/product/:id` | 商品详情 | 详情展示、加购、收藏 |
| `/cart` | 购物车 | 购物车管理、结算 |
| `/orders` | 订单列表 | 订单状态筛选、操作 |
| `/profile` | 个人中心 | 用户信息、资产、菜单 |
| `/login` | 登录注册 | 登录/注册切换 |
| `/addresses` | 收货地址 | 地址管理 |
| `/favorites` | 我的收藏 | 收藏商品列表 |
| `/coupons` | 优惠券 | 优惠券列表 |
| `/notifications` | 消息通知 | 消息列表、已读 |

### 状态管理

```typescript
// 购物车 - 全局状态 + 实时角标
useCartStore()

// 认证 - localStorage 持久化
useAuthStore()

// 收藏 - localStorage 持久化
useFavoriteStore()

// Toast 通知
useToastStore()
```

## 🎨 设计系统

### Design Tokens (index.css)

```css
/* 色彩 */
--color-primary-500: #22c55e      /* 品牌绿 */
--color-accent-500: #f59e0b       /* 强调金 */
--color-earth-500: #bc6c25        /* 大地色 */

/* 排版 */
--text-xs ~ --text-5xl            /* 12种字号 */
--font-sans: 'Noto Sans SC', ...  /* 中文优先 */

/* 间距 */
--space-1 ~ --space-20            /* 10级间距 */

/* 圆角 */
--radius-sm ~ --radius-full       /* 5级圆角 */

/* 阴影 */
--shadow-sm ~ --shadow-glow       /* 5级阴影 */
```

### 组件库

```html
<!-- 按钮 -->
<button class="btn btn-primary btn-lg">
<button class="btn btn-secondary btn-sm">
<button class="btn btn-accent">

<!-- 卡片 -->
<div class="card">
<div class="glass">  <!-- 毛玻璃效果 -->

<!-- 徽章 -->
<span class="badge badge-fresh">
<span class="badge badge-hot">
```

## 🤖 AI 客服

纯前端智能对话引擎 (`chatService.ts`)：

**能力：**
- 意图识别 (8种)
- 关键词提取
- 商品查询与推荐
- 页面导航

**示例：**
```
用户: "有什么苹果"
AI: 显示苹果商品卡片

用户: "推荐商品"
AI: 显示热销 TOP3

用户: "我的订单"
AI: [前往订单] 按钮
```

## 🔧 开发规范

### 路径别名

```typescript
// ✅ 使用别名
import { mockApi } from '@/services/mockApi'
import { useCartStore } from '@/store/cartStore'

// ❌ 避免相对路径
import { mockApi } from '../../services/mockApi'
```

### 组件规范

```typescript
// 页面组件
const PageName = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  
  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated])
  
  return <main className="page-name-page container section">
}

// CSS 模块
.page-name-page { min-height: 60vh; }
```

### Mock API 调用

```typescript
// 所有 API 带延迟模拟
const data = await mockApi.getProducts()
// ⏱ 模拟 360ms 延迟

// Toast 反馈
showToast('操作成功', 'success')
showToast('操作失败', 'error')
```

## 📊 构建产物

```bash
npm run build

# 产物
dist/
├── index.html          1.07 KB (gzip: 0.60 KB)
├── assets/
│   ├── index.css      52.79 KB (gzip: 8.90 KB)
│   └── index.js      314.95 KB (gzip: 96.49 KB)
└── favicon.svg
```

## 🌐 浏览器支持

- Chrome / Edge (最新)
- Firefox (最新)
- Safari 15+

---

**MIT License © 2026**


- **React 19.2** - 最新稳定版
- **TypeScript 6.0** - 类型安全
- **Vite 8.0** - 极速构建工具
- **Zustand 5.0** - 轻量级状态管理
- **React Router 7.15** - 路由管理
- **纯 CSS** - 自定义设计系统，无 UI 框架依赖

## 🏗️ 架构特性

### 状态管理
- **cartStore** - 全局购物车状态，实时同步购物车角标
- **authStore** - 登录态管理 + localStorage 持久化
- **toastStore** - 全局 Toast 通知系统

### 基础设施
- **useAsync** hook - 统一异步请求样板代码
- **ErrorBoundary** - React 错误边界
- **ScrollToTop** - 路由切换自动滚动到顶部
- **Toast** - 全局消息通知组件
- **NotFound** - 404 页面

### 工程化
- **路径别名** - `@/` 指向 `src/`，简化导入路径
- **类型安全** - 完整 TypeScript 类型定义
- **代码规范** - ESLint 10 + TypeScript ESLint 8

## 📦 功能模块

| 模块 | 页面路径 | 功能描述 |
|------|---------|---------|
| 首页 | `/` | 轮播、分类、热销商品、产地溯源 |
| 商品列表 | `/products` | 分类筛选、排序、搜索、库存过滤 |
| 商品详情 | `/product/:id` | 商品信息、加购/立即购买、评价 |
| 购物车 | `/cart` | 购物车管理、全选、结算 |
| 订单列表 | `/orders` | 订单状态筛选、付款/取消/收货 |
| 个人中心 | `/profile` | 用户资产、最近订单、优惠券、退出登录 |
| 登录注册 | `/login` | 登录/注册切换，持久化登录态 |

## 🎨 设计系统

采用自定义设计令牌体系：

- **色彩系统** - Primary (自然绿)、Accent (丰收金)、Earth (大地色)、语义色
- **排版系统** - 字号 xs~5xl、中英文字体适配
- **间距系统** - 1~20 级间距标准
- **圆角系统** - sm/md/lg/xl/full
- **阴影系统** - sm/md/lg/xl + 光晕效果
- **动画系统** - fadeIn/slideDown/pulse/shimmer

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# ESLint 检查
npm run lint
```

## 📂 项目结构

```
src/
├── components/           # 公共组件
│   ├── common/          # 通用组件 (Toast, ErrorBoundary, ScrollToTop)
│   ├── Header/          # 页头
│   ├── Footer/          # 页脚
│   └── ProductCard/     # 商品卡片
├── pages/               # 页面组件
│   ├── Home/           # 首页
│   ├── ProductList/    # 商品列表
│   ├── ProductDetail/  # 商品详情
│   ├── Cart/           # 购物车
│   ├── Orders/         # 订单
│   ├── Profile/        # 个人中心
│   ├── Login/          # 登录注册
│   └── NotFound/       # 404 页面
├── store/              # Zustand 状态管理
│   ├── cartStore.ts    # 购物车 store
│   ├── authStore.ts    # 认证 store
│   └── toastStore.ts   # 通知 store
├── hooks/              # 自定义 hooks
│   └── useAsync.ts     # 异步请求 hook
├── services/           # API 服务
│   └── mockApi.ts      # 模拟 API (738行，完整 CRUD)
├── data/               # Mock 数据
│   └── mockData.ts     # 商品/分类/订单/用户数据
├── types/              # TypeScript 类型定义
│   └── index.ts        # 领域模型类型
├── utils/              # 工具函数
│   ├── format.ts       # 格式化工具
│   └── imageFallback.ts # 图片 fallback 生成器
├── App.tsx             # 根组件
├── main.tsx            # 入口文件
└── index.css           # 全局样式 + 设计系统
```

## 🎯 核心实现

### 1. 购物车实时同步

Header 的购物车角标通过 zustand 订阅 `cartStore.count`，任何页面加购/删除/结算后自动更新：

```typescript
const cartCount = useCartStore((state) => state.count);
```

### 2. 登录态持久化

`authStore` 使用 zustand 的 `persist` 中间件，登录态自动保存到 localStorage：

```typescript
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({ /* ... */ }),
    { name: 'auth-storage' }
  )
);
```

### 3. 全局 Toast 通知

任何页面通过 `useToastStore` 触发通知，自动 3 秒后消失：

```typescript
const showToast = useToastStore((state) => state.show);
showToast('加入购物车成功', 'success');
```

### 4. Mock API 模拟

完整的异步模拟 API (316 行)，包含延迟、状态管理、错误处理，无需后端即可演示完整流程。

## 🌐 浏览器支持

- Chrome / Edge (最新版)
- Firefox (最新版)
- Safari 15+

## 📄 许可证

MIT License

---

**演示项目 · 仅供学习交流 · 2026**
