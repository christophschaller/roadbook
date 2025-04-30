import { useState } from "react";
import { ChevronLeft, ChevronRight, Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@nanostores/react";
import type { ResourceView, Rider } from "@/types";
import { handleResourceChange } from "@/components/react/MainControlsBar/utils/handleResourceChange";
import { POISelectorContainer } from "../POISelectorContainer";
import {
  $displayRiders,
  $riderStore,
  $focusRider,
  $mobileResourceIndex,
} from "@/stores";
import { IconSwitch } from "@/components/ui/IconSwitch";
import { Label } from "@/components/ui/label";
import { getRiderLastSeen, getRiderColor } from "@/lib/utils";
import { TrackSelector } from "./TrackSelector";

function TrackSelectContainer() {
  return (
    <div className="space-y-2">
      <TrackSelector />
      <p className="text text-sm text-primary/60">
        Welcome to our little sideproject!
        <br />
        Explore points of interest along the Shardana route. Or track where
        other riders currently are.
      </p>
      <div className="text-xs text-primary/40 text-right flex justify-center">
        <a href="/impressum" className="underline hover:text-primary/70">
          Impressum
        </a>
      </div>
    </div>
  );
}

function ResourceContainer({ resource }: { resource: ResourceView }) {
  return (
    <div className="space-y-2">
      <div className="w-full flex items-center space-x-2 p-2 rounded-md hover:bg-white/50 transition-colors">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: `rgb(${resource.color.join(",")})`,
          }}
        >
          {typeof resource.icon === "string" ? (
            <img
              src={`/icons/${resource.icon}`}
              alt={resource.name}
              className="w-5 h-5"
            />
          ) : (
            <resource.icon className="w-5 h-5" color="white" />
          )}
        </div>
        <span className="text-lg text-primary">{resource.name}</span>
      </div>
      <div className="ml-4">
        <POISelectorContainer resource={resource} />
      </div>
    </div>
  );
}

function RidersContainer() {
  const displayRiders = useStore($displayRiders);
  const { data: riders, loading: ridersLoading } = useStore($riderStore);

  const handleOnCheckedChange = (checked: boolean) => {
    $displayRiders.set(checked);
  };

  return (
    <div className="flex flex-col w-full h-full space-y-2">
      <div className="w-full items-center space-x-2 p-2 rounded-md hover:bg-white/50 transition-colors">
        <IconSwitch
          checked={Boolean(riders && displayRiders)}
          onChange={handleOnCheckedChange}
          icon={Bike}
          color={[82, 38, 98]}
        />
        <Label className="text-base">Show Riders</Label>
      </div>
      <div className="max-h-full overflow-y-scroll rounded-lg">
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
                  <span>{rider.display_name}</span>
                </div>
                <span className="text-sm text-primary/60">
                  {getRiderLastSeen(rider)}
                </span>
              </div>
            ))}
          </div>
        )}
        {!riders && (
          <div className="flex justify-center">
            <span>Tracking not available!</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function MobileContainerCarousel({
  resources,
  showRiders = true,
}: {
  resources: ResourceView[];
  showRiders?: boolean;
}) {
  const mobileResourceIndex = useStore($mobileResourceIndex);
  const items = showRiders
    ? [{ id: "riders", type: "riders" }, ...resources]
    : resources;

  const handlePrevious = () => {
    $mobileResourceIndex.set(mobileResourceIndex - 1);
    if (mobileResourceIndex > 1) {
      handleResourceChange(resources[mobileResourceIndex - 2].id);
    } else {
      handleResourceChange("");
    }
  };

  const handleNext = () => {
    $mobileResourceIndex.set(mobileResourceIndex + 1);
    if (mobileResourceIndex >= 0 && mobileResourceIndex < resources.length) {
      handleResourceChange(resources[mobileResourceIndex].id);
    }
  };

  const chevronLeftButton = (
    <button
      onClick={handlePrevious}
      disabled={mobileResourceIndex === -1}
      className={cn(
        "absolute left-4 z-20 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20",
        mobileResourceIndex === -1
          ? "opacity-50 cursor-not-allowed"
          : "opacity-100 hover:bg-black/30",
      )}
    >
      <ChevronLeft className="h-6 w-6 text-white" />
    </button>
  );

  const chevronRightButton = (
    <button
      onClick={handleNext}
      disabled={mobileResourceIndex === items.length - 1}
      className={cn(
        "absolute right-4 z-20 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20",
        mobileResourceIndex === items.length - 1
          ? "opacity-50 cursor-not-allowed"
          : "opacity-100 hover:bg-black/30",
      )}
    >
      <ChevronRight className="h-6 w-6 text-white" />
    </button>
  );

  return (
    <>
      {chevronLeftButton}
      <div className="h-full w-full p-5 m-10 rounded-2xl bg-white/80 backdrop-blur-md">
        {mobileResourceIndex === -1 ? (
          <RidersContainer />
        ) : mobileResourceIndex === 0 ? (
          <TrackSelectContainer />
        ) : (
          <ResourceContainer resource={resources[mobileResourceIndex - 1]} />
        )}
      </div>
      {chevronRightButton}
    </>
  );
}
