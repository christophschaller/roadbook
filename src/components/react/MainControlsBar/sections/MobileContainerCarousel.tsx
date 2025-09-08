import { useState } from "react";
import { ChevronLeft, ChevronRight, Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@nanostores/react";
import type { ResourceView, Rider } from "@/types";
import { handleResourceChange } from "@/components/react/MainControlsBar/utils/handleResourceChange";
import { POISelectorContainer } from "../POISelectorContainer";
import { $mobileResourceIndex } from "@/stores";

function TrackSelectContainer() {
  return (
    <div className="space-y-2">
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
    <div className="space-y-2 flex flex-col h-full">
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
      <div className="ml-4 h-full overflow-y-auto py-1">
        <POISelectorContainer resource={resource} />
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

  const clampedIndex = Math.min(
    Math.max(mobileResourceIndex, 0),
    Math.max(resources.length - 1, 0),
  );

  const handlePrevious = () => {
    const newIndex = Math.max(clampedIndex - 1, 0);
    if (newIndex !== clampedIndex) {
      $mobileResourceIndex.set(newIndex);
      handleResourceChange(resources[newIndex].id);
    }
  };

  const handleNext = () => {
    const newIndex = Math.min(
      clampedIndex + 1,
      Math.max(resources.length - 1, 0),
    );
    if (newIndex !== clampedIndex) {
      $mobileResourceIndex.set(newIndex);
      handleResourceChange(resources[newIndex].id);
    }
  };

  const chevronLeftButton = (
    <button
      onClick={handlePrevious}
      disabled={clampedIndex === 0}
      className={cn(
        "absolute left-4 z-20 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20",
        clampedIndex === 0
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
      disabled={clampedIndex === resources.length - 1}
      className={cn(
        "absolute right-4 z-20 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20",
        clampedIndex === resources.length - 1
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
        {resources[clampedIndex] ? (
          <ResourceContainer resource={resources[clampedIndex]} />
        ) : null}
      </div>
      {chevronRightButton}
    </>
  );
}
