import { useStore } from "@nanostores/react";
import { $location, $isTracking } from "@/stores";
import { Locate, LocateOff, LocateFixed } from "lucide-react";

function GeoLocateButton({}) {
  const isTracking = useStore($isTracking);
  const location = useStore($location);

  const toggleTracking = () => {
    $isTracking.set(!isTracking);
  };

  return (
    <button
      onClick={toggleTracking}
      className="fixed top-[60%] right-3 z-10 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20 opacity-100 hover:bg-black/30"
    >
      {!isTracking ? (
        <LocateOff className="h-6 w-6 text-white" />
      ) : location ? (
        <LocateFixed className="h-6 w-6 text-sky-500" />
      ) : (
        <Locate className="h-6 w-6 text-white" />
      )}
    </button>
  );
}

export default GeoLocateButton;
