"use client";

import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import cartReducer from "./cartSlice";
import authReducer from "./authSlice";

// Setiap slice butuh persist key unik - berbagi key yang sama membuat
// keduanya menulis ke storage entry yang sama dan saling menimpa.
const persistedCartReducer = persistReducer({ key: "cart", storage }, cartReducer);
const persistedAuthReducer = persistReducer({ key: "auth", storage }, authReducer);

// Setup store
export const store = configureStore({
  reducer: {
    cart: persistedCartReducer,
    auth: persistedAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
