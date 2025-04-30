import { useState } from "react";
import { ChevronLeft, ChevronRight, Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@nanostores/react";
import type { ResourceView, Rider } from "@/types";
import { handleResourceChange } from "@/components/react/MainControlsBar/utils/handleResourceChange";
import { POISelectorContainer } from "../POISelectorContainer";
import { $displayRiders, $riderStore } from "@/stores";
import { IconSwitch } from "@/components/ui/IconSwitch";
import { Label } from "@/components/ui/label";

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
          <resource.icon className="w-5 h-5" color="white" />
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
    <div className="space-y-4">
      <div className="flex items-center space-x-2 py-1">
        <IconSwitch
          checked={Boolean(riders && displayRiders)}
          onChange={handleOnCheckedChange}
          icon={Bike}
          color={[0, 0, 0]}
        />
        <Label className="text-base">Show Riders</Label>
      </div>
      {riders && (
        <div className="space-y-2">
          {Object.values(riders).map((rider: Rider) => (
            <div
              key={rider.tid}
              className="flex justify-between items-center p-2 rounded-md bg-white/50"
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium">{rider.cap_number}</span>
                <span>{rider.display_name}</span>
              </div>
              <span className="text-sm text-primary/60">{rider.isotst}</span>
            </div>
          ))}
        </div>
      )}
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
  const [activeIndex, setActiveIndex] = useState(0);
  const items = showRiders
    ? [{ id: "riders", type: "riders" }, ...resources]
    : resources;

  const handlePrevious = () => {
    setActiveIndex(activeIndex - 1);
    if (activeIndex > 1) {
      handleResourceChange(resources[activeIndex - 2].id);
    }
  };

  const handleNext = () => {
    setActiveIndex(activeIndex + 1);
    if (activeIndex >= 0 && activeIndex < resources.length) {
      handleResourceChange(resources[activeIndex].id);
    }
  };

  const chevronLeftButton = (
    <button
      onClick={handlePrevious}
      disabled={activeIndex === 0}
      className={cn(
        "absolute left-4 z-20 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20",
        activeIndex === 0
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
      disabled={activeIndex === items.length - 1}
      className={cn(
        "absolute right-4 z-20 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20",
        activeIndex === items.length - 1
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
      <div className="w-full p-5 m-10 rounded-2xl bg-white/80 backdrop-blur-md">
        {activeIndex === 0 ? (
          <RidersContainer />
        ) : (
          <ResourceContainer resource={resources[activeIndex - 1]} />
        )}
      </div>
      {chevronRightButton}
    </>
  );
}
