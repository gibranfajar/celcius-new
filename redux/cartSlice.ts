import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { StoreStock } from "@/lib/api/types";

export interface CartItem {
  productSizeId: number;
  productId: number;
  slug: string;
  /** "men" or "women", for the link back to the product; absent on older carts. */
  productType?: string;
  name: string;
  colorName: string;
  size: string;
  thumbnailUrl: string;
  price: number;
  finalPrice: number;
  weight: number;
  quantity: number;
  /** The store the shopper picked to buy from; absent on older carts. */
  storeCode?: string | null;
  storeName?: string | null;
  storeAddress?: string | null;
  storeLatitude?: number | null;
  storeLongitude?: number | null;
  storeMapsUrl?: string | null;
  /** How many that store had in stock when the item was added. */
  maxQuantity?: number | null;
}

/** The store fields of a cart item, from the store picked. */
export type CartStore = Pick<
  CartItem,
  | "storeCode"
  | "storeName"
  | "storeAddress"
  | "storeLatitude"
  | "storeLongitude"
  | "storeMapsUrl"
  | "maxQuantity"
>;

export function cartStoreFrom(store: StoreStock): CartStore {
  return {
    storeCode: store.store_code,
    storeName: store.name,
    storeAddress: store.address ?? `${store.city}, ${store.province}`,
    storeLatitude: store.latitude,
    storeLongitude: store.longitude,
    storeMapsUrl: store.maps_url,
    maxQuantity: store.qty,
  };
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
        // The latest store picked wins, along with its stock.
        Object.assign(existingItem, {
          storeCode: newItem.storeCode,
          storeName: newItem.storeName,
          storeAddress: newItem.storeAddress,
          storeLatitude: newItem.storeLatitude,
          storeLongitude: newItem.storeLongitude,
          storeMapsUrl: newItem.storeMapsUrl,
          maxQuantity: newItem.maxQuantity,
        });
        existingItem.quantity = Math.min(
          existingItem.quantity + 1,
          newItem.maxQuantity ?? Infinity,
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
      if (item && item.quantity < (item.maxQuantity ?? Infinity)) {
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

    /** Buy an item from another store, keeping no more than it has. */
    changeStore: (
      state,
      action: PayloadAction<{ productSizeId: number; store: CartStore }>,
    ) => {
      const { productSizeId, store } = action.payload;
      const item = state.items.find((i) => i.productSizeId === productSizeId);
      if (item) {
        Object.assign(item, store);
        item.quantity = Math.max(
          1,
          Math.min(item.quantity, store.maxQuantity ?? Infinity),
        );
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
  changeStore,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
