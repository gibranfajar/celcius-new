import { formatDateTime } from "@/lib/formatDateTime";
import formatProductName from "@/lib/formatProductName";
import getStatusStyle from "@/lib/getStatusStyle";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

type OrderType = any;

function OrderDetailModal({
  order,
  onClose,
}: {
  order: any;
  onClose: () => void;
}) {
  // LOCK BODY SCROLL WHEN MODAL OPEN
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const isPending = order.payment_order.payment_status === "PENDING";
  const isExpired = new Date(order.payment_order.expired_at) < new Date();

  const subtotal = order.order_details.reduce(
    (sum: number, item: any) => sum + item.total,
    0,
  );

  const discount = order.discount ?? 0;
  const isHomeDelivery = order.orderType === "HOME DELIVERY";
  const shippingCost = isHomeDelivery ? (order?.cost_shipping ?? 0) : 0;
  const grandTotal = subtotal - discount + shippingCost;

  const handlePay = () => {
    onClose();
    if (!window.snap) {
      alert("Payment service not ready, please wait...");
      return;
    }

    window.snap.pay(order.payment_order.token, {
      onSuccess: function () {
        toast.success("Payment successful 🎉");
      },

      onPending: function () {
        toast.loading("Waiting for payment ⏳");
      },

      onError: function () {
        toast.error("Payment failed ❌");
      },

      onClose: function () {
        toast("Payment popup closed", {
          icon: "⚠️",
        });
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-3">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg relative p-4">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 text-lg cursor-pointer"
        >
          ✕
        </button>

        {/* HEADER */}
        <h2 className="text-base md:text-lg font-semibold mb-4">
          Order Detail – {order.invoice}
        </h2>

        {/* SHIPPING INFO */}
        <div className="border p-3 mb-3 text-xs md:text-sm">
          <h3 className="font-semibold mb-2">Shipping Information</h3>
          <p>
            <span className="font-medium">Name:</span>{" "}
            {order.shipping_order.name}
          </p>
          <p>
            <span className="font-medium">Phone:</span>{" "}
            {order.shipping_order.phone_number}
          </p>
          <p>
            <span className="font-medium">Address:</span>{" "}
            {order.shipping_order.address}
          </p>
          <p>
            <span className="font-medium">Region:</span>{" "}
            {[
              order.shipping_order.district,
              order.shipping_order.city,
              order.shipping_order.province,
            ]
              .filter(Boolean)
              .join(", ") || "-"}
          </p>
          <p>
            <span className="font-medium">Postal Code:</span>{" "}
            {order.shipping_order.postal_code}
          </p>
        </div>

        {/* ORDER TYPE */}
        <div className="border p-3 mb-3 text-xs md:text-sm">
          <h3 className="font-semibold mb-1">Order Type</h3>
          {isHomeDelivery ? (
            <span className="text-blue-600 font-medium">Home Delivery</span>
          ) : (
            <span className="text-green-600 font-medium">Store Pickup</span>
          )}
        </div>

        {/* PRODUCTS */}
        <div className="space-y-4">
          {order.order_details.map((item: any) => (
            <div
              key={item.id}
              className="border p-3 text-xs md:text-sm
                       flex flex-col md:flex-row gap-3"
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.product.images[0]?.path}`}
                className="w-full md:w-24 h-40 md:h-24 object-cover"
                alt={item.product.name}
                width={96}
                height={96}
              />

              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm md:text-base">
                  {formatProductName(item.product.name)}
                </p>
                <p>Color: {formatProductName(item.color)}</p>
                <p>Size: {item.size}</p>
                <p>Qty: {item.quantity}</p>
                <p className="text-gray-500">Store: {item.store_name}</p>
              </div>

              <div className="font-semibold text-right md:text-left">
                Rp {item.total.toLocaleString("id-ID")}
              </div>
            </div>
          ))}
        </div>

        {/* PAYMENT DETAILS */}
        <div className="mt-6 border-t pt-4 text-xs md:text-sm space-y-1">
          <h3 className="font-semibold">Payment Details</h3>
          <p>
            <span className="font-medium">Payment Method:</span>{" "}
            {order.payment_order.payment_method}
          </p>
          <p>
            <span className="font-medium">Payment Status:</span>{" "}
            {order.payment_order.payment_status}
          </p>
          {order.payment_order.payment_status?.toLowerCase() === "pending" && (
            <p>
              <span className="font-medium">Expired At:</span>{" "}
              <span className="text-red-600">
                {formatDateTime(order.payment_order.expired_at)}
              </span>
            </p>
          )}
        </div>

        {/* SUMMARY */}
        <div className="mt-4 border-t pt-4 text-xs md:text-sm">
          <h3 className="font-semibold mb-2">Order Summary</h3>

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>

          <div className="flex justify-between">
            <span>Discount</span>
            <span>- Rp {discount.toLocaleString("id-ID")}</span>
          </div>

          {isHomeDelivery && (
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
            </div>
          )}

          <div className="flex justify-between font-semibold text-base md:text-lg mt-2">
            <span>Grand Total</span>
            <span>Rp {grandTotal.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* PAY BUTTON */}
        {isPending && !isExpired && (
          <div className="bg-white pt-3 mt-4">
            <button
              onClick={handlePay}
              className="w-full bg-black text-white py-3 text-sm md:text-base hover:bg-black/80 cursor-pointer"
            >
              Pay Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Order({
  orders,
  onCancelSuccess,
}: {
  orders: OrderType[];
  onCancelSuccess: () => void;
}) {
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);

  const handleCancel = async (order: OrderType) => {
    const result = await Swal.fire({
      title: "Cancel Order?",
      text: `Do you want to cancel invoice ${order.invoice}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "No",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token"); // ⬅️ pastikan sama seperti login

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}order/cancel/${order.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      toast.success(`Order ${order.invoice} canceled successfully!`);
    } catch (error: any) {
      console.error("Error canceling order:", error);

      Swal.fire({
        title: "Failed",
        text:
          error.response?.status === 401
            ? "Unauthorized. Please login again."
            : "Failed to cancel order. Please try again.",
        icon: "error",
      });
    } finally {
      onCancelSuccess();
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">My Orders</h1>

      {orders.map((order) => {
        const now = new Date();
        const expiredAt = order.expired_at ? new Date(order.expired_at) : null;
        const isExpired = expiredAt ? expiredAt >= now : false;
        const status = order.status.toLowerCase();
        const canCancel = ["pending"].includes(status);

        return (
          <div
            key={order.id}
            className="border p-2 flex justify-between items-center"
          >
            {/* LEFT */}
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Invoice:</span> {order.invoice}
              </p>

              <p>
                <span className="font-medium">Total:</span> Rp{" "}
                {order.payment_order.total.toLocaleString("id-ID")}
              </p>

              <p>
                <span className="font-medium">Status:</span>{" "}
                <span className={getStatusStyle(order.status).color}>
                  {getStatusStyle(order.status).label}
                </span>
              </p>

              {/* tampilkan expired hanya kalau benar-benar expired */}
              {isExpired && order.status?.toLowerCase() === "pending" && (
                <p className="text-xs text-gray-500">
                  Expired at:{" "}
                  <span className="text-red-600">
                    {formatDateTime(order.expired_at)}
                  </span>
                </p>
              )}
            </div>

            {/* RIGHT */}
            <div className="flex flex-col md:flex-row md:justify-end gap-2 md:w-fit">
              <button
                onClick={() => setSelectedOrder(order)}
                className="border px-4 py-2 text-sm hover:bg-black hover:text-white cursor-pointer w-full md:w-auto"
              >
                View Detail
              </button>

              {canCancel && (
                <button
                  onClick={() => handleCancel(order)}
                  className="border px-4 py-2 text-sm hover:bg-red-600 hover:text-white cursor-pointer w-full md:w-auto"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* MODAL */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
