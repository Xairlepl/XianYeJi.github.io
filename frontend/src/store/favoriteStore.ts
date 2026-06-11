import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteStore {
  favoriteIds: number[];
  toggle: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  count: number;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      count: 0,

      toggle: (productId) => {
        const { favoriteIds } = get();
        const newIds = favoriteIds.includes(productId)
          ? favoriteIds.filter((id) => id !== productId)
          : [...favoriteIds, productId];
        set({ favoriteIds: newIds, count: newIds.length });
      },

      isFavorite: (productId) => {
        return get().favoriteIds.includes(productId);
      },
    }),
    {
      name: 'favorite-storage',
      partialize: (state) => ({ favoriteIds: state.favoriteIds, count: state.count }),
    }
  )
);
