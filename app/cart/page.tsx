"use client";

import Link from "next/link";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "@/redux/cartSlice";
import { formatToIdr } from "@/lib/formatToIdr";
import formatProductName from "@/lib/formatProductName";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingBag, Trash2 } from "lucide-react";

export default function Cart() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const handleShipping = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    router.push("/checkout");
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.finalPrice * item.quantity,
    0,
  );

  const hasOutOfStock = cartItems.some((item) => item.stock <= 0);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 text-center seccond-font">
        <ShoppingBag size={32} className="text-gray-300" />
        <div>
          <p className="font-medium text-zinc-700">Your cart is empty.</p>
          <p className="text-sm text-zinc-500 mt-1">
            Looks like you haven&apos;t added anything yet.
          </p>
        </div>
        <Link
          href="/"
          className="mt-2 inline-block bg-black text-white text-xs tracking-wide font-medium px-6 py-3 hover:bg-zinc-800 transition"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 seccond-font mx-auto">
      <h1 className="text-2xl mb-6">Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="bg-black text-white py-2.5 px-4 text-xs tracking-wide font-medium">
            PRODUCTS ({cartItems.length})
          </h2>

          <div className="space-y-4 py-4">
            {cartItems.map((item) => (
              <div
                key={item.productSizeId}
                className="flex flex-col sm:flex-row border border-zinc-200 p-4 gap-4"
              >
                <div className="relative w-full sm:w-28 h-40 sm:h-28 shrink-0 bg-zinc-100">
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 text-sm min-w-0">
                  <h3 className="text-base font-semibold mb-1.5">
                    {formatProductName(item.name)}
                  </h3>

                  <div className="space-y-0.5 text-zinc-600">
                    <p>
                      {formatProductName(item.colorName)} · {item.size}
                    </p>
                    <p>{item.weight} gr</p>
                    <p className={item.stock <= 0 ? "text-red-600" : ""}>
                      {item.stock > 0
                        ? `${item.stock} in stock`
                        : "Out of stock"}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-3">
                  <button
                    onClick={() =>
                      dispatch(
                        removeFromCart({ productSizeId: item.productSizeId }),
                      )
                    }
                    aria-label="Remove item"
                    className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex items-center border border-gray-300">
                    <button
                      onClick={() =>
                        dispatch(
                          decrementQuantity({
                            productSizeId: item.productSizeId,
                          }),
                        )
                      }
                      disabled={item.quantity <= 1}
                      className="px-2.5 py-1 text-lg cursor-pointer disabled:text-gray-300 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button
                      onClick={() =>
                        dispatch(
                          incrementQuantity({
                            productSizeId: item.productSizeId,
                          }),
                        )
                      }
                      disabled={item.quantity >= item.stock}
                      className="px-2.5 py-1 text-lg cursor-pointer disabled:text-gray-300 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>

                  <p className="text-sm font-semibold">
                    {formatToIdr(item.finalPrice * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-20 h-fit">
          <h2 className="bg-black text-white py-2.5 px-4 text-xs tracking-wide font-medium">
            ORDER SUMMARY
          </h2>

          <div className="border border-t-0 border-zinc-200 p-5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <p className="text-zinc-500">Subtotal</p>
              <p>{formatToIdr(subtotal)}</p>
            </div>

            <div className="flex justify-between items-center text-sm">
              <p className="text-zinc-500">Shipping</p>
              <p className="text-zinc-500">Calculated at checkout</p>
            </div>

            <hr className="border-zinc-200" />

            <div className="flex justify-between items-center font-semibold">
              <p>Total</p>
              <p>{formatToIdr(subtotal)}</p>
            </div>

            {hasOutOfStock && (
              <p className="text-xs text-red-600">
                Remove out-of-stock items before proceeding to checkout.
              </p>
            )}

            <button
              onClick={handleShipping}
              disabled={hasOutOfStock}
              className={`w-full text-center px-4 py-3 text-sm font-medium tracking-wide transition cursor-pointer
                ${
                  hasOutOfStock
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-black text-white border border-black hover:bg-white hover:text-black"
                }`}
            >
              NEXT TO SHIPPING
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
