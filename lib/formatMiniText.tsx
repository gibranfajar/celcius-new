export const formatMiniText = (html: string, limit: number) => {
  if (!html) return { __html: "" };

  // Hapus tag HTML -> ambil teks saja
  const temp = new DOMParser().parseFromString(html, "text/html");
  const text = temp.body.textContent || "";

  // Potong
  const preview = text.length > limit ? text.substring(0, limit) + "..." : text;

  return { __html: preview };
};
