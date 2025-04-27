import "maplibre-gl/dist/maplibre-gl.css";
import type { PointOfInterest } from "@/types";
import { useState } from "react";
import { handleResourceChange } from "@/components/react/MainControlsBar/utils/handleResourceChange";
import { POISelectorContainer } from "../POISelectorContainer";

function ResourceContainer({
  resource,
  activeResource,
  onResourceChange,
}: {
  resource: PointOfInterest;
  activeResource: string;
  onResourceChange: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <button
        onClick={() =>
          onResourceChange(
            activeResource === String(resource.id) ? "" : String(resource.id),
          )
        }
        className="w-full flex items-center space-x-2 p-2 rounded-md hover:bg-white/50 transition-colors"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: `rgb(${resource.color?.join(",") || "0,0,0"})`,
          }}
        >
          {resource.icon && <img src={resource.icon} className="w-5 h-5" alt="Icon" />}
        </div>
        <span className="text-base md:text text-primary">{resource.name}</span>
      </button>
      {activeResource === String(resource.id) && (
        <div className="ml-4">
          <POISelectorContainer resource={resource} />
        </div>
      )}
    </div>
  );
}

export function POISectionDesktop({ pois }: { pois: PointOfInterest[] }) {
  const [activeResource, setActiveResource] = useState<string>("");

  const handleChange = (id: string) => {
    setActiveResource(id);
    handleResourceChange(id);
  };

  return (
    <div className="space-y-4 md:mt-0">
      <div className="space-y-2">
        <h3 className="font-medium text-lg md:text-base text-primary">
          Points of Interest
        </h3>
        <div>
          {pois.map((resource) => (
            <ResourceContainer
              key={resource.id}
              resource={resource}
              activeResource={activeResource}
              onResourceChange={handleChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
