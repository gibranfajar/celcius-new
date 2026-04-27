export function formatDate(dateString: string) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
