import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: string;
  name: string;
  article: string;
  color: string;
  size: string;
  store: string;
  storeName: string;
  quantity: number;
  price: number;
  image: string;
  fix_price: number;
  plu: string | null;
  latitude?: number;
  longitude?: number;
  weight?: number;
  discount?: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // 🛒 Tambah item baru / update quantity kalau sudah ada
    addToCart: (state, action: PayloadAction<Omit<CartItem, "quantity">>) => {
      const newItem = action.payload;

      const existingItem = state.items.find(
        (item) =>
          item.id === newItem.id &&
          item.store === newItem.store &&
          item.plu === newItem.plu,
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...newItem, quantity: 1 });
      }
    },

    updateCartStore: (
      state,
      action: PayloadAction<{
        id: string;
        oldStore: string;
        newStore: string;
        newPLU: string | null;
        newStoreName: string;
        latitude?: number;
        longitude?: number;
      }>,
    ) => {
      const {
        id,
        oldStore,
        newStore,
        newPLU,
        newStoreName,
        latitude,
        longitude,
      } = action.payload;

      const existingItem = state.items.find(
        (item) => item.id === id && item.store === oldStore,
      );

      if (existingItem) {
        existingItem.store = newStore;
        existingItem.plu = newPLU;
        existingItem.storeName = newStoreName;

        if (latitude) existingItem.latitude = latitude;
        if (longitude) existingItem.longitude = longitude;
      }
    },

    // ❌ Hapus item dari cart berdasarkan id + store
    removeFromCart: (
      state,
      action: PayloadAction<{ id: string; store: string }>,
    ) => {
      state.items = state.items.filter(
        (item) =>
          item.id !== action.payload.id || item.store !== action.payload.store,
      );
    },

    // 🧮 Tambah jumlah item (+1)
    incrementQuantity: (
      state,
      action: PayloadAction<{ id: string; store: string }>,
    ) => {
      const item = state.items.find(
        (i) => i.id === action.payload.id && i.store === action.payload.store,
      );
      if (item) {
        item.quantity += 1;
      }
    },

    // 🔽 Kurangi jumlah item (-1) dan hapus kalau quantity = 0
    decrementQuantity: (
      state,
      action: PayloadAction<{ id: string; store: string }>,
    ) => {
      const item = state.items.find(
        (i) => i.id === action.payload.id && i.store === action.payload.store,
      );
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.items = state.items.filter(
            (i) =>
              i.id !== action.payload.id || i.store !== action.payload.store,
          );
        }
      }
    },

    // 🧹 Hapus semua item
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  updateCartStore,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
