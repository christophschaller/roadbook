import "maplibre-gl/dist/maplibre-gl.css";
import { areaStore } from "@/stores/areaStore";
import { trackStore } from "@/stores/trackStore";
import { useStore } from "@nanostores/react";
import { type Feature, type LineString, type Polygon } from "geojson";
import { useState, useRef, useEffect } from "react";
import { poiTypes } from "@/lib/data";
import { POISelectorContainer } from "@/components/react/sidebar/AreaDefinition";
import UploadButton from "@/components/react/sidebar/UploadButton";
import type { TypeArea } from "@/types/area.types";

export function TrackEditor({
  trackData,
  typeAreas,
  area,
}: {
  trackData: LineString | null;
  typeAreas: TypeArea[] | null;
  area: ReturnType<typeof useStore<typeof areaStore>>;
}) {
  const [activeType, setActiveType] = useState<string>("");
  const track = useStore(trackStore);
  const [height, setHeight] = useState("50%");
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isMobile) return;
    setIsDragging(true);
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setStartHeight(sidebarRef.current?.offsetHeight || 0);
  };

  const handleDragMove = (e: TouchEvent | MouseEvent) => {
    if (!isDragging || !sidebarRef.current || !isMobile) return;

    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const deltaY = startY - clientY;
    const newHeight = startHeight + deltaY;
    const windowHeight = window.innerHeight;
    const heightPercentage = (newHeight / windowHeight) * 100;

    // Constrain height between 25% and 100% of window height
    setHeight(`${Math.max(25, Math.min(100, heightPercentage))}%`);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging && isMobile) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove);
      window.addEventListener("touchend", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, isMobile]);

  return (
    <>
      {/* Mobile Upload Button */}
      <div className="fixed bottom-4 left-4 z-50 md:hidden">
        <UploadButton className="rounded-full p-2 shadow-lg" />
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="absolute bottom-0 left-0 w-full md:w-64 md:left-[50px] md:top-[50px] md:h-[calc(100%-100px)] bg-white/80 backdrop-blur-md shadow-lg p-4 overflow-y-auto rounded-t-2xl md:rounded-2xl transition-transform duration-200"
        style={{ height: isMobile ? height : undefined }}
      >
        {/* Drag Handle */}
        <div
          className="absolute top-0 left-0 right-0 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing md:hidden"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        <div className="space-y-4 mt-8 md:mt-0">
          {/* Upload Button (Desktop only) */}
          <div className="hidden md:flex flex-col space-y-4">
            <UploadButton />
            {!track.data && (
              <p className="text text-primary/60 max-w-[200px]">
                Upload your GPX route, and we'll show you handy OSM-based
                stops—like water refill points, coffee spots, and a place to
                rest if you need it. Think of it as your reliable guide for
                those well-deserved breaks along the ride.
              </p>
            )}
          </div>

          {/* Track Information */}
          {track.data && trackData && (
            <div className="space-y-2">
              <h3 className="font-medium text-primary">Track Information</h3>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-primary/60">Track name:</span>
                  <p className="text-sm text-primary/80">{track.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-primary/60">GPX points:</span>
                  <p className="text-sm text-primary/80">
                    {trackData.coordinates.length}
                  </p>
                </div>
              </div>
            </div>
          )}

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
                  <span className="text-base md:text-sm text-primary">
                    {area.poiTypeMap[typeArea.typeId].name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
