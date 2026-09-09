import formatProductName from "@/lib/formatProductName";
import { formatToIdr } from "@/lib/formatToIdr";
import { removeFromCart } from "@/redux/cartSlice";
import { RootState } from "@/redux/store";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Trash2, ShoppingBag } from "lucide-react";

export default function CartBar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!mounted) return null; // cegah hydration error

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.finalPrice * item.quantity,
    0,
  );

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[85vw] max-w-80 bg-white shadow-lg z-50 flex flex-col transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header sidebar */}
      <div className="px-4 py-3.5 flex justify-between items-center border-b border-zinc-100 shrink-0">
        <h2 className="font-semibold text-sm tracking-wide">
          SHOPPING CART{cartItems.length > 0 ? ` (${cartItems.length})` : ""}
        </h2>
        <button
          onClick={onClose}
          aria-label="Close cart"
          className="cursor-pointer text-zinc-500 hover:text-black transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Konten scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center gap-3 text-center py-16">
            <ShoppingBag size={26} className="text-gray-300" />
            <p className="text-gray-500 text-sm">Your cart is empty.</p>
          </div>
        ) : (
          cartItems.map((cart) => (
            <div className="flex gap-3" key={cart.productSizeId}>
              <div className="relative w-14 h-14 shrink-0 bg-zinc-100">
                <Image src={cart.thumbnailUrl} alt={cart.name} fill className="object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="truncate">{formatProductName(cart.name)}</p>
                <span className="text-xs text-zinc-500">
                  {cart.size} · {formatToIdr(cart.finalPrice)} × {cart.quantity}
                </span>
              </div>

              <button
                onClick={() =>
                  dispatch(removeFromCart({ productSizeId: cart.productSizeId }))
                }
                aria-label="Remove item"
                className="text-zinc-400 hover:text-red-500 cursor-pointer transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="border-t border-zinc-100 p-4 space-y-3 shrink-0">
          <div className="flex justify-between text-sm font-semibold">
            <span>Subtotal</span>
            <span>{formatToIdr(subtotal)}</span>
          </div>
          <Link href="/cart" onClick={onClose}>
            <button className="block w-full text-center py-2.5 bg-black text-white text-xs font-medium tracking-wide hover:bg-zinc-800 transition-colors cursor-pointer">
              GO TO SHOPPING BAG
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
