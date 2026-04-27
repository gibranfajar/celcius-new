export default async function getLocationDetails(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id`
    );

    if (!res.ok) {
      throw new Error("Gagal mengambil data lokasi");
    }

    const data = await res.json();

    return {
      negara: data.address?.country || null,
      provinsi: data.address?.state || null,
      kota:
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.municipality ||
        null,
      alamat_lengkap: data.display_name || "",
      latitude: lat,
      longitude: lng,
    };
  } catch (error) {
    console.log("Gagal mengambil detail lokasi:", error);
    return null;
  }
}
