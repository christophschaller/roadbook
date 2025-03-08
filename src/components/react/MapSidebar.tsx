import "maplibre-gl/dist/maplibre-gl.css";
import { areaStore } from "@/stores/areaStore";
import { useStore } from "@nanostores/react";
import { type Feature, type LineString, type Polygon } from "geojson";

type TypeArea = {
  typeId: string;
  area: Feature;
};

export function MapSidebar({
  trackData,
  typeAreas,
  area,
}: {
  trackData: LineString | null;
  typeAreas: TypeArea[] | null;
  area: ReturnType<typeof useStore<typeof areaStore>>;
}) {
  return (
    <div className="absolute bottom-0 left-0 w-full md:w-64 md:left-[50px] md:top-[50px] md:h-[calc(100%-100px)] h-1/2 bg-off-white/40 backdrop-blur-md shadow-lg p-4">
      <h2 className="text-xl font-semibold mb-4 text-primary">Map Controls</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium text-primary">Track Information</h3>
          <p className="text-sm text-primary/80">
            {trackData
              ? `${trackData.coordinates.length} points`
              : "No track loaded"}
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-primary">Area Types</h3>
          <div className="space-y-2">
            {typeAreas?.map((typeArea) => (
              <div
                key={typeArea.typeId}
                className="flex items-center space-x-2"
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: `rgb(${area.poiTypeMap[typeArea.typeId].color.join(",")})`,
                  }}
                />
                <span className="text-sm text-primary">
                  {area.poiTypeMap[typeArea.typeId].name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
