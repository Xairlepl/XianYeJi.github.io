# 鲜野集电商演示项目

**鲜野集 (FreshWild)** - 基于 React 19 + TypeScript + Vite 的现代化农产品电商单页应用

[在线演示](#) | [功能特性](#功能特性) | [快速开始](#快速开始)

---

## 📦 项目概览

一个**生产级**的电商前端演示项目，完整实现了从商品浏览、购物车、订单管理到用户中心的全流程功能。采用纯前端 Mock 数据模拟，无需后端即可完整体验。

### 核心特性

- ✅ **11 个页面** - 覆盖电商全业务流程
- ✅ **4 个全局 Store** - Zustand 状态管理 + localStorage 持久化
- ✅ **AI 智能客服** - 纯前端对话引擎，支持商品查询与页面导航
- ✅ **完整 Mock** - 738 行数据 + 350 行 API，零后端依赖
- ✅ **现代架构** - React 19 + TypeScript 6 + Vite 8
- ✅ **设计系统** - 自定义 Design Tokens，无 UI 框架依赖

---

## 🎯 功能特性

### 业务功能

| 模块 | 功能点 |
|------|--------|
| **商品** | 首页展示、分类筛选、列表排序、关键词搜索、详情查看 |
| **购物车** | 加购、数量调整、全选、删除、结算，角标实时同步 |
| **订单** | 立即购买、订单列表、状态筛选、付款/取消/收货 |
| **用户** | 注册/登录、登录态持久化、个人中心、退出登录 |
| **收藏** | 商品收藏、取消收藏、收藏列表、localStorage 持久化 |
| **地址** | 地址管理、设为默认、删除 |
| **优惠券** | 优惠券列表、状态标签 |
| **消息** | 消息通知、标记已读、全部已读 |
| **AI 客服** | 智能对话、商品推荐、页面导航 |

### 技术亮点

- **实时同步** - 购物车角标、收藏数量即时更新
- **持久化** - 登录态、收藏数据自动保存
- **Toast 通知** - 统一操作反馈
- **错误处理** - ErrorBoundary + 图片 fallback
- **响应式** - 移动端适配
- **SEO 优化** - 完整 meta 标签

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev
# 访问 http://localhost:5173

# 生产构建
npm run build

# 预览构建
npm run preview

# 代码检查
npm run lint
```

---

## 📂 项目结构

```
frontend/
├── src/
│   ├── components/          # 公共组件
│   │   ├── common/          # 通用组件 (Toast, ErrorBoundary, AIChat)
│   │   ├── Header/          # 页头
│   │   ├── Footer/          # 页脚
│   │   └── ProductCard/     # 商品卡片
│   ├── pages/               # 页面组件 (11个)
│   ├── store/               # Zustand Store (4个)
│   ├── services/            # API 服务 (mockApi, chatService)
│   ├── data/                # Mock 数据 (738行)
│   ├── types/               # TypeScript 类型
│   ├── utils/               # 工具函数
│   └── hooks/               # 自定义 Hooks
├── public/                  # 静态资源
└── package.json
```

---

## 🎨 技术栈

### 核心框架
- **React 19.2** - 最新稳定版
- **TypeScript 6.0** - 类型安全
- **Vite 8.0** - 极速构建

### 状态管理
- **Zustand 5.0** - 轻量级状态管理
- **localStorage** - 数据持久化

### 路由
- **React Router 7.15** - 单页应用路由

### 样式
- **纯 CSS** - 自定义设计系统
- **CSS Variables** - Design Tokens
- **响应式** - 移动端适配

---

## 💡 设计系统

### 色彩体系
- **Primary** - 自然绿 (品牌色)
- **Accent** - 丰收金 (强调色)
- **Earth** - 大地色系
- **Semantic** - 成功/警告/错误/信息

### 排版
- 中文：Noto Sans SC
- 英文：Inter
- 字号：xs ~ 5xl (0.75rem ~ 3rem)

### 组件
- 按钮：primary / secondary / accent
- 卡片：card / glass (毛玻璃)
- 徽章：badge-fresh / badge-hot / badge-origin

---

## 🤖 AI 客服

纯前端智能对话引擎，支持：

```typescript
用户: "有什么水果"
AI: 为您找到 3 个水果相关商品 [商品卡片展示]

用户: "推荐商品"  
AI: 为您推荐热销商品 [TOP3展示]

用户: "我的订单"
AI: 您可以在"我的订单"中查看... [前往订单按钮]
```

**能力：**
- ✅ 意图识别 (8种)
- ✅ 关键词提取
- ✅ 商品查询与推荐
- ✅ 页面快速导航
- ✅ 商品卡片展示

---

## 📊 项目数据

| 指标 | 数值 |
|------|------|
| 页面数量 | 11 个 |
| 组件数量 | 20+ 个 |
| Store 数量 | 4 个 |
| Mock 商品 | 20+ 个 |
| 代码总行数 | 5000+ 行 |
| 构建体积 | 96.5 KB (gzip) |
| 构建时间 | < 300ms |

---

## 🔧 可用脚本

```bash
npm run dev      # 开发模式
npm run build    # 生产构建
npm run preview  # 预览构建
npm run lint     # ESLint 检查
```

---

## 📝 开发说明

### 路径别名
项目配置了 `@/` 指向 `src/`：

```typescript
import { mockApi } from '@/services/mockApi'
import { useCartStore } from '@/store/cartStore'
```

### Mock API
所有 API 调用均为纯前端模拟，带延迟效果：

```typescript
await mockApi.getProducts({ keyword: '苹果' })
// 模拟 360ms 网络延迟
```

### 状态持久化
登录态和收藏数据自动保存到 localStorage：

```typescript
// authStore - 登录态持久化
// favoriteStore - 收藏持久化
```

---

## 🌐 浏览器支持

- Chrome / Edge (最新)
- Firefox (最新)
- Safari 15+

---

## 📄 许可证

MIT License

---

## 👨‍💻 作者

**鲜野集电商演示** - 2026

演示项目 · 仅供学习交流

---

## 🎯 TODO

- [ ] 订单详情页
- [ ] 商品评价功能
- [ ] 搜索历史
- [ ] 地址新增/编辑表单
- [ ] 优惠券使用逻辑

---

**如有问题或建议，欢迎提交 Issue！**
