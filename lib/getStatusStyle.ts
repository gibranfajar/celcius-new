const getStatusStyle = (status?: string) => {
  switch (status?.toUpperCase()) {
    case "UNPAID":
    case "PENDING":
      return { label: "Unpaid", color: "text-orange-600" };

    case "PAID":
      return { label: "Paid", color: "text-green-600" };

    case "PROCESSING":
      return { label: "Processing", color: "text-blue-600" };

    case "SHIPPED":
      return { label: "On Delivery", color: "text-purple-600" };

    case "COMPLETED":
    case "DELIVERED":
      return { label: "Completed", color: "text-green-600" };

    case "CANCELLED":
      return { label: "Cancelled", color: "text-gray-500" };

    case "REFUNDED":
      return { label: "Refunded", color: "text-gray-500" };

    case "EXPIRED":
      return { label: "Expired", color: "text-red-600" };

    default:
      return { label: status ?? "-", color: "text-gray-400" };
  }
};

export default getStatusStyle;
