import { create } from 'zustand';
import { mockApi } from '@/services/mockApi';
import type { CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  count: number;
  loading: boolean;
  init: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  toggleCheck: (id: number, checked: boolean) => Promise<void>;
  toggleAll: (checked: boolean) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  refreshCount: () => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  count: 0,
  loading: false,

  init: async () => {
    set({ loading: true });
    const items = await mockApi.getCart();
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    set({ items, count, loading: false });
  },

  addItem: async (productId, quantity) => {
    await mockApi.addToCart(productId, quantity);
    await get().refreshCount();
  },

  updateQuantity: async (id, quantity) => {
    const items = await mockApi.updateCartItem(id, quantity);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    set({ items, count });
  },

  toggleCheck: async (id, checked) => {
    const items = await mockApi.toggleCartItem(id, checked);
    set({ items });
  },

  toggleAll: async (checked) => {
    const items = await mockApi.toggleAllCartItems(checked);
    set({ items });
  },

  removeItem: async (id) => {
    const items = await mockApi.removeCartItem(id);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    set({ items, count });
  },

  refreshCount: async () => {
    const summary = await mockApi.getCartSummary();
    set({ count: summary.count });
  },
}));
