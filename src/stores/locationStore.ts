import { atom, onMount } from "nanostores";

export const $isTracking = atom(false); // User's tracking preference
export const $location = atom(null); // User's current location

onMount($location, () => {
  let watchId: number | undefined;

  const startTracking = () => {
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(latitude, longitude, accuracy);
          $location.set({ latitude, longitude, accuracy });
        },
        (error) => {
          console.error(`Geolocation error: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 500,
        },
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const stopTracking = () => {
    if (watchId !== undefined) {
      navigator.geolocation.clearWatch(watchId);
      watchId = undefined;
    }
    $location.set(null);
  };

  const unsubscribe = $isTracking.listen((tracking) => {
    if (tracking) {
      startTracking();
    } else {
      stopTracking();
    }
  });

  // Start tracking if already enabled
  if ($isTracking.get()) {
    startTracking();
  }

  return () => {
    stopTracking();
    unsubscribe();
  };
});
