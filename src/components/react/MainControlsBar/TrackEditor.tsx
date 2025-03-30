import "maplibre-gl/dist/maplibre-gl.css";
import { areaStore } from "@/stores/areaStore";
import { trackStore } from "@/stores/trackStore";
import { useStore } from "@nanostores/react";
import { type LineString } from "geojson";
import { useState } from "react";
import { poiTypes } from "@/lib/data";
import { POISelectorContainer } from "@/components/react/MainControlsBar/AreaDefinition";
import type { TypeArea } from "@/types/area.types";

export function TrackEditor({
  typeAreas,
  area,
}: {
  typeAreas: TypeArea[] | null;
  area: ReturnType<typeof useStore<typeof areaStore>>;
}) {
  const [activeType, setActiveType] = useState<string>("");

  return (
    <div className="space-y-4 md:mt-0">
      {/* Points of Interest */}
      <div className="space-y-2">
        <h3 className="font-medium text-lg md:text-base text-primary">
          Points of Interest
        </h3>
        <div className="">
          {poiTypes.map((poiType) => (
            <div key={poiType.id} className="space-y-2">
              <button
                onClick={() =>
                  setActiveType(activeType === poiType.id ? "" : poiType.id)
                }
                className="w-full flex items-center space-x-2 p-2 rounded-md hover:bg-white/50 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `rgb(${poiType.color.join(",")})`,
                  }}
                >
                  <poiType.icon className="w-5 h-5" color="white" />
                </div>
                <span className="text-base md:text text-primary">
                  {poiType.name}
                </span>
              </button>
              {activeType === poiType.id && (
                <div className="ml-4">
                  <POISelectorContainer poiType={poiType} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Areas */}
      <div className="space-y-2">
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
      </div>
    </div>
  );
}
