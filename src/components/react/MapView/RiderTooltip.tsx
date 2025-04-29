import { useRef, useEffect, useState } from "react";
import type { Rider } from "@/types";
import { X, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRiderColor } from "@/lib/utils";

export function RiderTooltip({
  rider,
  viewport,
  onClose,
}: {
  rider: Rider;
  viewport: any;
  onClose?: () => void;
}) {
  try {
    const ref = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const [x, y] = viewport.project([rider.lon, rider.lat]);

    return (
      <div
        ref={ref}
        className={`${
          isMobile
            ? "w-full fixed top-0 left-0 right-0 rounded-b-2xl"
            : "w-128 absolute rounded-2xl"
        } p-4 bg-white/80 backdrop-blur-md transition-transform duration-200`}
        style={{
          zIndex: 10,
          ...(isMobile ? {} : { left: `${x}px`, top: `${y}px` }),
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <Bike
              className="w-8 h-8"
              color={`rgb(${getRiderColor(rider.username || "").join(",")})`}
            />
          </div>
          <div className="flex-grow text-center">
            {rider.display_name != null && rider.display_name !== "" && (
              <div className="flex items-center justify-center gap-2">
                {isMobile ? (
                  <h5 className="font-bold text-lg">{rider.display_name}</h5>
                ) : (
                  <p className="font-bold text-md">{rider.display_name}</p>
                )}
              </div>
            )}
            <div className="flex items-center justify-center gap-2"></div>
          </div>
          <Button
            type="button"
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 hover:bg-gray-200 focus:outline-none"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-6 h-6 text-black" />
          </Button>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering PoiTooltip:", error);
    return null;
  }
}
