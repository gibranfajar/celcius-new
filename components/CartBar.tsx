import formatProductName from "@/lib/formatProductName";
import { formatToIdr } from "@/lib/formatToIdr";
import { removeFromCart } from "@/redux/cartSlice";
import { RootState } from "@/redux/store";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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
  if (!mounted) return null; // cegah hydration error
  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header sidebar */}
      <div className="px-4 py-[14px] flex justify-between items-center shadow">
        <h2 className="font-semibold">SHOPPING CART</h2>
        <button onClick={onClose} className="text-xl cursor-pointer">
          <i className="bi bi-x"></i>
        </button>
      </div>

      {/* Konten scrollable */}
      <div className="h-[calc(100%-56px)] overflow-y-auto p-4 space-y-4 text-sm">
        {/* Product Card */}
        {cartItems.map((cart, index) => (
          <div className="flex justify-between items-center" key={index}>
            <div className="flex items-start">
              <Image
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${cart.image}`}
                alt="Product"
                className="w-12 h-12 object-cover"
                width={48}
                height={48}
              />
              <div className="ml-4">
                <p>{formatProductName(cart.name)}</p>
                <span className="text-sm seccond-font">
                  {formatToIdr(cart.price)} x {cart.quantity} ({cart.size})
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                dispatch(
                  removeFromCart({
                    id: cart.id,
                    store: cart.store,
                  }),
                )
              }
              className="text-red-500 cursor-pointer"
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        ))}

        <hr className="text-gray-300" />

        <Link href="/cart">
          <button
            onClick={onClose}
            className="block w-full text-center py-2 bg-black text-white hover:bg-black/80 transition-colors cursor-pointer"
          >
            GO TO SHOPPING BAG
          </button>
        </Link>
      </div>
    </div>
  );
}
