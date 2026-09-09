import { formatDateTime } from "@/lib/formatDateTime";
import { formatDate } from "@/lib/formatDate";
import formatProductName from "@/lib/formatProductName";
import { formatToIdr } from "@/lib/formatToIdr";
import getStatusStyle from "@/lib/getStatusStyle";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X, Truck, CreditCard, PackageOpen, History } from "lucide-react";
import { confirmOrder, payOrder } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";
import { Order as OrderType } from "@/lib/api/types";

async function payForOrder(orderId: number): Promise<void> {
  const { snap_token } = await payOrder(orderId);

  if (typeof window === "undefined" || !window.snap) {
    toast.error("Payment service is not ready yet. Please wait a moment and try again.");
    return;
  }

  window.snap.pay(snap_token, {
    onSuccess: () => toast.success("Payment successful 🎉"),
    onPending: () => toast("Waiting for payment ⏳", { icon: "⏳" }),
    onError: () => toast.error("Payment failed ❌"),
    onClose: () => toast("Payment popup closed", { icon: "⚠️" }),
  });
}

function StatusBadge({ status }: { status: string }) {
  const style = getStatusStyle(status);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wide border ${style.color} border-current/30 bg-current/5`}
    >
      {style.label}
    </span>
  );
}

function OrderDetailModal({
  order,
  onClose,
  onConfirmed,
}: {
  order: OrderType;
  onClose: () => void;
  onConfirmed: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await confirmOrder(order.order_id);
      toast.success("Order confirmed as received.");
      onConfirmed();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setConfirming(false);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      await payForOrder(order.order_id);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-lg relative">
        <div className="sticky top-0 bg-white flex items-center justify-between px-4 md:px-5 py-3.5 border-b border-zinc-100 z-10">
          <div>
            <h2 className="text-sm font-semibold">{order.order_number}</h2>
            <p className="text-[11px] text-zinc-400">{formatDate(order.created_at)}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-zinc-400 hover:text-black transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 md:p-5 space-y-5">
          <StatusBadge status={order.status} />

          {/* SHIPPING INFO */}
          <div className="border border-zinc-200 p-3.5 text-xs space-y-1">
            <h3 className="font-semibold mb-1.5 flex items-center gap-1.5">
              <Truck size={13} /> Shipping Information
            </h3>
            <p>
              <span className="font-medium">Name:</span> {order.shipping_receiver_name}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {order.shipping_phone}
            </p>
            <p>
              <span className="font-medium">Address:</span> {order.shipping_address}
            </p>
            <p>
              <span className="font-medium">Region:</span>{" "}
              {[order.shipping_district, order.shipping_city, order.shipping_province]
                .filter(Boolean)
                .join(", ") || "-"}
            </p>
            <p>
              <span className="font-medium">Postal Code:</span> {order.shipping_postal_code}
            </p>
            {order.shipment && (
              <>
                <p>
                  <span className="font-medium">Courier:</span> {order.shipment.courier_code} -{" "}
                  {order.shipment.courier_service}
                </p>
                {order.shipment.waybill_number && (
                  <p>
                    <span className="font-medium">Waybill:</span>{" "}
                    {order.shipment.waybill_number}
                  </p>
                )}
              </>
            )}
          </div>

          {/* PRODUCTS */}
          <div className="space-y-2.5">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="border border-zinc-200 p-3 text-xs flex justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">{formatProductName(item.product_name)}</p>
                  <p className="text-zinc-500">
                    {formatProductName(item.variant_color_name)} · {item.size_name} × {item.quantity}
                  </p>
                </div>

                <div className="font-semibold text-right shrink-0">
                  {formatToIdr(item.subtotal)}
                </div>
              </div>
            ))}
          </div>

          {/* PAYMENT DETAILS */}
          {order.payment && (
            <div className="text-xs space-y-1">
              <h3 className="font-semibold mb-1.5 flex items-center gap-1.5">
                <CreditCard size={13} /> Payment Details
              </h3>
              <p>
                <span className="font-medium">Method:</span> {order.payment.payment_method}
              </p>
              <p>
                <span className="font-medium">Status:</span> {order.payment.status}
              </p>
              {order.payment.paid_at && (
                <p>
                  <span className="font-medium">Paid At:</span>{" "}
                  {formatDateTime(order.payment.paid_at)}
                </p>
              )}
            </div>
          )}

          {/* ORDER HISTORY */}
          {order.histories.length > 0 && (
            <div className="text-xs space-y-1">
              <h3 className="font-semibold mb-2 flex items-center gap-1.5">
                <History size={13} /> Order History
              </h3>
              <div className="space-y-3">
                {order.histories.map((history, index) => (
                  <div key={index} className="flex gap-2.5">
                    <div className="flex flex-col items-center pt-0.5">
                      <span
                        className={`size-1.5 rounded-full ${
                          index === 0 ? "bg-black" : "bg-zinc-300"
                        }`}
                      />
                      {index !== order.histories.length - 1 && (
                        <span className="w-px flex-1 bg-zinc-200 mt-1" />
                      )}
                    </div>
                    <div className="pb-3">
                      <p
                        className={`font-medium capitalize ${
                          index === 0 ? "text-black" : "text-zinc-500"
                        }`}
                      >
                        {history.status.replace(/_/g, " ")}
                      </p>
                      {history.description && (
                        <p className="text-zinc-500 mt-0.5">{history.description}</p>
                      )}
                      <p className="text-zinc-400 mt-0.5">
                        {formatDateTime(history.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUMMARY */}
          <div className="border-t border-zinc-100 pt-4 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-zinc-500">Subtotal</span>
              <span>{formatToIdr(order.subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500">Discount</span>
              <span>- {formatToIdr(order.discount_amount)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500">Shipping</span>
              <span>{formatToIdr(order.shipping_cost)}</span>
            </div>

            <div className="flex justify-between font-semibold text-base pt-2 border-t border-zinc-100 mt-2">
              <span>Grand Total</span>
              <span>{formatToIdr(order.grand_total)}</span>
            </div>
          </div>

          {order.status === "unpaid" && (
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full bg-black text-white py-3 text-sm font-medium tracking-wide hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
            >
              {paying ? "Loading..." : "Pay Now"}
            </button>
          )}

          {order.status === "shipped" && (
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full bg-black text-white py-3 text-sm font-medium tracking-wide hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
            >
              {confirming ? "Confirming..." : "Confirm Received"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Order({
  orders,
  onRefresh,
}: {
  orders: OrderType[];
  onRefresh: () => void;
}) {
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);

  const handleQuickPay = async (orderId: number) => {
    setPayingId(orderId);
    try {
      await payForOrder(orderId);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">My Orders</h1>

      {orders.length === 0 && (
        <div className="flex flex-col items-center gap-3 text-gray-500 py-16">
          <PackageOpen size={28} className="text-gray-300" />
          <p className="text-sm">You have no orders yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.order_id}
            className="border border-zinc-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1.5 text-sm min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium">{order.order_number}</p>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-zinc-500 text-xs">{formatDate(order.created_at)}</p>
              <p className="font-semibold">{formatToIdr(order.grand_total)}</p>
            </div>

            <div className="flex gap-2 shrink-0">
              {order.status === "unpaid" && (
                <button
                  onClick={() => handleQuickPay(order.order_id)}
                  disabled={payingId === order.order_id}
                  className="flex-1 sm:flex-none border border-black bg-black text-white px-4 py-2 text-xs font-medium tracking-wide hover:bg-white hover:text-black cursor-pointer disabled:opacity-50"
                >
                  {payingId === order.order_id ? "Loading..." : "PAY NOW"}
                </button>
              )}

              <button
                onClick={() => setSelectedOrder(order)}
                className="flex-1 sm:flex-none border border-zinc-300 px-4 py-2 text-xs font-medium tracking-wide hover:border-black cursor-pointer"
              >
                VIEW DETAIL
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onConfirmed={onRefresh}
        />
      )}
    </div>
  );
}
