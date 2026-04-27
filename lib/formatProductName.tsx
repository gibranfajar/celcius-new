function formatProductName(name: string) {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => {
      // biar kata kayak "T-SHIRT" juga jadi "T-Shirt"
      return word
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-");
    })
    .join(" ");
}

export default formatProductName;
