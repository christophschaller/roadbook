import { useState } from "react";
import { LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MapViewState } from "@deck.gl/core";

interface LocateButtonProps {
  onLocate: (position: Pick<MapViewState, "longitude" | "latitude">) => void;
}

export function LocateButton({ onLocate }: LocateButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (!navigator.geolocation) {
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocate({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        });
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      className="absolute right-4 top-4 z-10 size-[3.375rem] bg-white/90 shadow-md backdrop-blur-sm hover:bg-white [&_svg]:size-6"
      onClick={handleClick}
      disabled={loading || !navigator.geolocation}
      aria-label="Center map on your location"
      title="Center map on your location"
    >
      <LocateFixed className={loading ? "animate-pulse" : undefined} />
    </Button>
  );
}
