# 🌾 龙野农品 - 农产品电商演示前端

一个基于 **React 19 + TypeScript + Vite** 的现代化农产品电商单页应用，采用全局状态管理、组件化架构与完整的 UI 设计系统。

## ✨ 技术栈

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
