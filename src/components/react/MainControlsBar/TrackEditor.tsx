import "maplibre-gl/dist/maplibre-gl.css";
import type { ResourceView } from "@/types";
import { useState } from "react";
import { POISelectorContainer } from "@/components/react/MainControlsBar/POISelectorContainer";
import { handleResourceChange } from "@/components/react/MainControlsBar/handleResourceChange";

function ResourceContainer({
  resource,
  activeResource,
  onResourceChange,
}: {
  resource: ResourceView;
  activeResource: string;
  onResourceChange: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <button
        onClick={() =>
          onResourceChange(activeResource === resource.id ? "" : resource.id)
        }
        className="w-full flex items-center space-x-2 p-2 rounded-md hover:bg-white/50 transition-colors"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: `rgb(${resource.color.join(",")})`,
          }}
        >
          <resource.icon className="w-5 h-5" color="white" />
        </div>
        <span className="text-base md:text text-primary">{resource.name}</span>
      </button>
      {activeResource === resource.id && (
        <div className="ml-4">
          <POISelectorContainer resource={resource} />
        </div>
      )}
    </div>
  );
}

export function TrackEditor({
  resources,
}: {
  resources: Record<string, ResourceView>;
}) {
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
          {Object.values(resources).map((resource) => (
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
