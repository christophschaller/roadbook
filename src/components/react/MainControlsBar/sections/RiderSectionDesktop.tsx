import "maplibre-gl/dist/maplibre-gl.css";
import { useStore } from "@nanostores/react";
import { Label } from "@/components/ui/label";
import { $displayRiders, $riderStore, $focusRider } from "@/stores";
import { IconSwitch } from "@/components/ui/IconSwitch";
import { Bike } from "lucide-react";
import type { Rider } from "@/types";
import { getRiderColor, getRiderLastSeen } from "@/lib/utils";

export function RiderSectionDesktop() {
  const displayRiders = useStore($displayRiders);
  const { data: riders, loading: ridersLoading } = useStore($riderStore);

  const handleOnCheckedChange = (checked: boolean) => {
    $displayRiders.set(checked);
  };

  return (
    <div className="space-y-4 md:mt-0">
      <div className="space-y-2">
        <h3 className="font-medium text-lg md:text-base text-primary">
          Riders
        </h3>
        <div className="mx-2">
          <div className="flex items-center space-x-2 py-1">
            <IconSwitch
              checked={Boolean(riders && displayRiders)}
              onChange={(checked: boolean) => handleOnCheckedChange(checked)}
              icon={Bike}
              color={[82, 38, 98]}
            />
            <Label className="text-base md:text-sm">Show Riders</Label>
          </div>
        </div>
        {riders && (
          <div className="space-y-2">
            {Object.values(riders).map((rider: Rider) => (
              <div
                key={rider.tid}
                className="flex justify-between items-center p-2 rounded-xl bg-white/50"
              >
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => $focusRider.set(rider)}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:border-white/20 border"
                    style={{
                      backgroundColor: `rgb(${getRiderColor(rider.username).join(",")})`,
                    }}
                  >
                    <span className="font-xs">{rider.cap_number}</span>
                  </button>
                  <span className="text-md">{rider.display_name}</span>
                </div>
                <span className="text-xs text-primary/60">
                  {getRiderLastSeen(rider)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
