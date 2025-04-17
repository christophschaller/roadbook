import { useRef } from "react";
import type { LineString } from "geojson";

import { trackStore } from "@/stores/trackStore";
import { useStore } from "@nanostores/react";
import { TrackEditor } from "@/components/react/MainControlsBar/TrackEditor";
import UploadButton from "@/components/react/MainControlsBar/UploadButton";
import { areaStore } from "@/stores/areaStore";
import { TrackInformation } from "@/components/react/MainControlsBar/TrackInformation";

export function MainControlsBar() {
  const track = useStore(trackStore);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const trackData = track.data
    ? (track.data.features[0].geometry as LineString)
    : null;
  const area = useStore(areaStore);

  return (
    <>
      <div
        ref={sidebarRef}
        className="absolute bottom-0 left-0 w-full md:w-64 md:left-[50px] md:top-[50px] md:h-[calc(100%-100px)] bg-white/80 backdrop-blur-md shadow-lg p-4 overflow-y-auto rounded-t-2xl md:rounded-2xl transition-transform duration-200"
      >
        <div className="space-y-4 md:mt-0">
          <div className="flex flex-col space-y-4">
            <UploadButton />
            {!track.data && (
              <p className="text text-primary/60">
                Upload your GPX route, and we'll show you handy OSM-based
                stops—like water refill points, coffee spots, and a place to
                rest if you need it. Think of it as your reliable guide for
                those well-deserved breaks along the ride.
              </p>
            )}
          </div>
        </div>
        {track && trackData && (
          <TrackInformation track={track} trackData={trackData} />
        )}
        <TrackEditor resourceAreas={[]} area={area} />
      </div>
    </>
  );
}
