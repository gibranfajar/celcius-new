export default function getUserLocation(): Promise<GeolocationPosition | null> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position);
      },
      (error) => {
        console.log("Error getting user location:", error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 detik timeout
        maximumAge: 0,
      }
    );
  });
}
