const getStatusStyle = (status?: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return { label: "Pending", color: "text-orange-600" };

    case "PROCESSING":
      return { label: "Processing", color: "text-blue-600" };

    case "PAID":
      return { label: "Paid", color: "text-green-600" };

    case "EXPIRED":
      return { label: "Expired", color: "text-red-600" };

    case "CANCELLED":
      return { label: "Cancelled", color: "text-gray-500" };

    // pengiriman
    case "READY_TO_SHIP":
      return { label: "Ready to Ship", color: "text-blue-500" };

    case "SHIPPED":
      return { label: "On Delivery", color: "text-purple-600" };

    case "DELIVERED":
      return { label: "Delivered", color: "text-green-600" };

    default:
      return { label: status ?? "-", color: "text-gray-400" };
  }
};

export default getStatusStyle;
