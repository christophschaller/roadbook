import "maplibre-gl/dist/maplibre-gl.css";
import { areaStore } from "@/stores/areaStore";
import { trackStore } from "@/stores/trackStore";
import { useStore } from "@nanostores/react";
import { type LineString } from "geojson";
import { useState } from "react";
import { POISelectorContainer } from "@/components/react/MainControlsBar/AreaDefinition";
import type { ResourceArea } from "@/types/area.types";

export function TrackEditor({
  resourceAreas,
  area,
}: {
  resourceAreas: ResourceArea[] | null;
  area: ReturnType<typeof useStore<typeof areaStore>>;
}) {
  const [activeResource, setActiveResource] = useState<string>("");

  const handleResourceChange = (id: string) => {
    setActiveResource(id);
    const currentStore = areaStore.get();
    const updatedResourceMap = Object.fromEntries(
      Object.entries(currentStore.ResourceMap).map(([resourceId, resourceData]) => [
        resourceId,
        {
          ...resourceData,
          active: resourceId === id,
        },
      ])
    );
    areaStore.set({
      ...currentStore,
      ResourceMap: updatedResourceMap,
    });
  };

  return (
    <div className="space-y-4 md:mt-0">
      {/* Points of Interest */}
      <div className="space-y-2">
        <h3 className="font-medium text-lg md:text-base text-primary">
          Points of Interest
        </h3>
        <div className="">
          {Object.values(area.ResourceMap).map((resource) => (
            <div key={resource.id} className="space-y-2">
              <button
                onClick={() =>
                  handleResourceChange(activeResource === resource.id ? "" : resource.id)
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
                <span className="text-base md:text text-primary">
                  {resource.name}
                </span>
              </button>
              {activeResource === resource.id && (
                <div className="ml-4">
                  <POISelectorContainer resource={resource} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Areas */}
      {/* <div className="space-y-2">
        <h3 className="font-medium text-lg md:text-base text-primary">
          Active Areas
        </h3>
        <div className="space-y-2">
          {typeAreas?.map((typeArea) => (
            <div key={typeArea.typeId} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: `rgb(${area.poiTypeMap[typeArea.typeId].color.join(",")})`,
                }}
              />
              <span className="text-base md:text-sm text-primary">
                {area.poiTypeMap[typeArea.typeId].name}
              </span>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}
