import { mockProducts, mockCategories } from '@/data/mockData';
import type { Product } from '@/types';

interface ChatResponse {
  text: string;
  action?: {
    type: 'navigate' | 'product' | 'search';
    target: string;
    label: string;
  };
  products?: Product[];
}

// 意图识别
const detectIntent = (input: string): string => {
  const lower = input.toLowerCase();

  if (/帮助|功能|怎么用|指南/.test(lower)) return 'help';
  if (/商品|产品|有什么|卖什么/.test(lower)) return 'products';
  if (/订单|购买|买了/.test(lower)) return 'orders';
  if (/购物车|加购/.test(lower)) return 'cart';
  if (/个人|我的|账号/.test(lower)) return 'profile';
  if (/搜索|查找|找/.test(lower)) return 'search';
  if (/分类|类别/.test(lower)) return 'categories';
  if (/推荐|热销|爆款/.test(lower)) return 'recommend';

  return 'unknown';
};

// 关键词提取
const extractKeyword = (input: string): string => {
  const keywords = ['苹果', '橙', '米', '茶', '蔬菜', '水果', '肉', '海鲜'];
  for (const kw of keywords) {
    if (input.includes(kw)) return kw;
  }
  return '';
};

export const chatService = {
  processMessage: (input: string): ChatResponse => {
    const intent = detectIntent(input);
    const keyword = extractKeyword(input);

    switch (intent) {
      case 'help':
        return {
          text: '我可以帮您：\n• 查询商品信息\n• 推荐热销商品\n• 跳转到相关页面\n• 搜索商品\n\n试试问我"有什么水果"或"推荐商品"！',
        };

      case 'products':
        if (keyword) {
          const results = mockProducts.filter((p) =>
            p.name.includes(keyword) || p.categoryName.includes(keyword)
          ).slice(0, 3);
          return {
            text: `为您找到 ${results.length} 个${keyword}相关商品：`,
            products: results,
          };
        }
        return {
          text: `目前有 ${mockProducts.length} 个商品，包括水果、蔬菜、粮油等分类。`,
          action: { type: 'navigate', target: '/products', label: '查看全部商品' },
        };

      case 'orders':
        return {
          text: '您可以在"我的订单"中查看所有订单状态。',
          action: { type: 'navigate', target: '/orders', label: '前往我的订单' },
        };

      case 'cart':
        return {
          text: '您的购物车在这里，快去结算吧！',
          action: { type: 'navigate', target: '/cart', label: '查看购物车' },
        };

      case 'profile':
        return {
          text: '个人中心包含订单、收藏、优惠券等功能。',
          action: { type: 'navigate', target: '/profile', label: '前往个人中心' },
        };

      case 'search':
        if (keyword) {
          return {
            text: `正在为您搜索"${keyword}"...`,
            action: { type: 'search', target: `/products?keyword=${keyword}`, label: '查看搜索结果' },
          };
        }
        return { text: '请告诉我您想搜索什么商品？' };

      case 'categories':
        const catList = mockCategories.map((c) => c.name).join('、');
        return {
          text: `我们有以下分类：${catList}`,
          action: { type: 'navigate', target: '/products', label: '浏览商品分类' },
        };

      case 'recommend':
        const hot = mockProducts.sort((a, b) => b.sales - a.sales).slice(0, 3);
        return {
          text: '为您推荐热销商品：',
          products: hot,
        };

      default:
        return {
          text: '抱歉，我没太理解您的意思。您可以问我：\n• "有什么水果"\n• "推荐商品"\n• "如何购买"',
        };
    }
  },
};
