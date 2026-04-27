"use client";

import { RootState } from "@/redux/store";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "@/redux/cartSlice";
import ModalBranchStore from "@/components/ModalBranchStore";
import getUserLocation from "@/lib/getUserLocation";
import getLocationDetails from "@/lib/getUserLocationDetails";
import { formatToIdr } from "@/lib/formatToIdr";
import formatProductName from "@/lib/formatProductName";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import Image from "next/image";

export default function Cart() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [userLocation, setUserLocation] = useState<any | null>(null);

  // 🧩 Local state buat stok hasil fetch
  const [stocks, setStocks] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const results: Record<string, any> = {};
        setIsLoading(true);

        await Promise.all(
          cartItems.map(async (item) => {
            const response = await axios.get(
              `https://golangapi-j5iu.onrender.com/api/global/stock/o/`,
              {
                params: {
                  article: item.article,
                  size: item.size,
                  color: item.color,
                  provinsi: "ALL",
                },
              },
            );

            const matchedStore = response.data.itemDetail?.find(
              (store: any) => store.store_id === item.store,
            );

            // key unik per item
            const key = `${item.article}-${item.size}-${item.store}`;

            results[key] = matchedStore || null;
          }),
        );

        // update once
        setStocks(results);
      } catch (err) {
        console.error("Error fetching stock:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (cartItems.length === 0) {
      setStocks({});
      setIsLoading(false);
      return;
    }

    fetchStocks();
  }, [cartItems]);

  const fetchUserLocation = async () => {
    const pos = await getUserLocation();
    if (pos) {
      const { latitude, longitude } = pos.coords;
      const details = await getLocationDetails(latitude, longitude);
      setUserLocation(details);
    } else {
      console.log("User denied or location unavailable.");
    }
  };

  useEffect(() => {
    fetchUserLocation();
  }, []);

  const handleShipping = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first.");
      return;
    }

    router.push("/checkout");
  };

  let subtotal = 0;
  cartItems.forEach((item: any) => {
    subtotal += item.price * item.quantity;
  });

  // cek apakah ada item yang out of stock
  const hasOutOfStock = cartItems.some((item: any) => {
    const stockKey = `${item.article}-${item.size}-${item.store}`;
    const itemStock = stocks[stockKey];
    return !itemStock || itemStock.qty <= 0;
  });

  // loading fetch
  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <ClipLoader size={40} color="#000" />
      </div>
    );

  return (
    <div className="p-4 seccond-font">
      <h1 className="text-2xl mb-3">Cart</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="">
          <h2 className="bg-black text-white py-2 px-4 text-sm">PRODUCTS</h2>

          <div className="space-y-6 p-4">
            {cartItems.map((item: any, index: number) => {
              const stockKey = `${item.article}-${item.size}-${item.store}`;
              const itemStock = stocks[stockKey];
              const maxStock = itemStock?.qty ?? 0;

              return (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-start border p-4 gap-4"
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.image}`}
                    alt={item.name}
                    className="w-32 h-32 object-cover"
                    width={128}
                    height={128}
                  />

                  <div className="flex-1 text-sm">
                    <h3 className="text-base font-semibold mb-2">
                      {formatProductName(item.name)}
                    </h3>

                    <div className="space-y-1">
                      <p>
                        <span className="font-medium">Color</span> -{" "}
                        {formatProductName(item.color)}, {item.size} (
                        {item.quantity} pcs)
                      </p>
                      <p>
                        <span className="font-medium">Weight</span> -{" "}
                        {item.weight} gr
                      </p>
                      <p>
                        <span className="font-medium">SKU</span> -{" "}
                        {item.article}
                      </p>
                      <p>
                        <span className="font-medium">Branch Store</span> :{" "}
                        {itemStock?.brand ?? "-"} {itemStock?.kota ?? ""}
                      </p>

                      <p>
                        <span className="font-medium">Stock available</span> :{" "}
                        {itemStock?.qty ?? 0} pcs
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedProduct(item);
                        setOpenModal(true);
                      }}
                      className="mt-3 border border-black px-3 py-1 text-xs hover:bg-black hover:text-white transition cursor-pointer"
                    >
                      CHANGE BRANCH
                    </button>
                  </div>

                  {openModal && selectedProduct && (
                    <ModalBranchStore
                      onRequestLocation={fetchUserLocation}
                      onClose={() => setOpenModal(false)}
                      userLocation={userLocation}
                      dataProduct={selectedProduct}
                    />
                  )}

                  <div className="flex flex-col items-end justify-between h-full">
                    <button
                      onClick={() => dispatch(removeFromCart(item))}
                      className="text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      <i className="bi bi-trash text-lg"></i>
                    </button>

                    <div className="flex items-center border border-gray-300">
                      <button
                        onClick={() =>
                          dispatch(
                            decrementQuantity({
                              id: item.id,
                              store: item.store,
                            }),
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="px-2 text-lg cursor-pointer disabled:text-gray-300 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <span className="px-3">{item.quantity}</span>
                      <button
                        onClick={() =>
                          dispatch(
                            incrementQuantity({
                              id: item.id,
                              store: item.store,
                            }),
                          )
                        }
                        disabled={item.quantity >= maxStock}
                        className="px-2 text-lg cursor-pointer disabled:text-gray-300 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-sm font-semibold mt-2">
                      {formatToIdr(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Voucher applly and Checkout Summary */}
        <div className="">
          <div className="">
            <h2 className="bg-black text-white py-2 px-4 text-sm">
              COUPON CODE
            </h2>

            <div className="flex flex-col md:flex-col items-start p-6 gap-4">
              <p className="text-xs">
                If you have a coupon code, please enter it in the box below
              </p>

              <input
                type="text"
                placeholder="Enter the coupon code"
                className="border-b px-4 py-2 w-full text-sm focus:outline-none"
              />

              <button className="bg-black text-white px-4 py-2 text-sm hover:bg-white hover:text-black hover:border transition cursor-pointer">
                APPLY COUPON
              </button>
            </div>
          </div>
          <div className="">
            <h2 className="bg-black text-white py-2 px-4 text-sm">
              ORDER SUMMARY
            </h2>

            <div className="flex flex-col items-start p-6 gap-4">
              <div className="flex justify-between items-center w-full">
                <p className="text-xs text-zinc-400">Subtotal</p>
                <p className="text-xs">{formatToIdr(subtotal)}</p>
              </div>

              <hr className="border-zinc-200 w-full mb-1" />

              <div className="flex justify-between items-center w-full">
                <p className="text-xs text-zinc-400">Shipping</p>
                <p className="text-xs">Rp 0</p>
              </div>

              <hr className="border-zinc-200 w-full mb-1" />

              <div className="flex justify-between items-center w-full">
                <p className="text-xs text-green-400">Discount</p>
                <p className="text-xs">Rp 0</p>
              </div>

              <hr className="border-zinc-200 w-full mb-1" />

              <div className="flex justify-between items-center w-full">
                <p className="text-xs text-zinc-400">Total</p>
                <p className="text-xs">{formatToIdr(subtotal)}</p>
              </div>
            </div>

            <div className="flex justify-center items-center">
              <span
                onClick={() => {
                  if (hasOutOfStock) return;
                  handleShipping();
                }}
                className={`text-center px-4 py-2 text-sm w-1/2 transition
                    ${
                      hasOutOfStock
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-black text-white border border-transparent hover:bg-white hover:text-black hover:border-black cursor-pointer"
                    }
                  `}
              >
                NEXT TO SHIPPING
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
