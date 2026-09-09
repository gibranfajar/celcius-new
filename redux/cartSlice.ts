import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  productSizeId: number;
  productId: number;
  slug: string;
  name: string;
  colorName: string;
  size: string;
  thumbnailUrl: string;
  price: number;
  finalPrice: number;
  weight: number;
  stock: number;
  quantity: number;
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
    addToCart: (state, action: PayloadAction<Omit<CartItem, "quantity">>) => {
      const newItem = action.payload;
      const existingItem = state.items.find(
        (item) => item.productSizeId === newItem.productSizeId,
      );

      if (existingItem) {
        existingItem.quantity = Math.min(
          existingItem.quantity + 1,
          existingItem.stock,
        );
      } else {
        state.items.push({ ...newItem, quantity: 1 });
      }
    },

    removeFromCart: (state, action: PayloadAction<{ productSizeId: number }>) => {
      state.items = state.items.filter(
        (item) => item.productSizeId !== action.payload.productSizeId,
      );
    },

    incrementQuantity: (state, action: PayloadAction<{ productSizeId: number }>) => {
      const item = state.items.find(
        (i) => i.productSizeId === action.payload.productSizeId,
      );
      if (item && item.quantity < item.stock) {
        item.quantity += 1;
      }
    },

    decrementQuantity: (state, action: PayloadAction<{ productSizeId: number }>) => {
      const item = state.items.find(
        (i) => i.productSizeId === action.payload.productSizeId,
      );
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.items = state.items.filter(
            (i) => i.productSizeId !== action.payload.productSizeId,
          );
        }
      }
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
