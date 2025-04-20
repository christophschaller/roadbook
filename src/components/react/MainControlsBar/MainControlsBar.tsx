import { useEffect, useRef } from "react";
import type { LineString } from "geojson";

import { trackStore } from "@/stores/trackStore";
import { useStore } from "@nanostores/react";
import { resourceViewStore } from "@/stores/resourceStore";
import { TrackEditor } from "@/components/react/MainControlsBar/TrackEditor";
import UploadButton from "@/components/react/MainControlsBar/UploadButton";
import { TrackInformation } from "@/components/react/MainControlsBar/TrackInformation";
import { useIsMobile } from "@/hooks/use-mobile";

export function MainControlsBar() {
  const isMobile = useIsMobile();

  return isMobile ? <MainControlsMobile /> : <MainControlsDesktop />;
}

function MainControlsDesktop() {
  return (
    <div className="absolute bottom-0 left-0 w-full md:w-64 md:left-[50px] md:top-[50px] md:h-[calc(100%-100px)] bg-white/80 backdrop-blur-md shadow-lg p-4 overflow-y-auto rounded-t-2xl md:rounded-2xl transition-transform duration-200">
        <MainControlsContent />
    </div>
  );
}

function MainControlsMobile() {
  return <MainControlsContent />;
}

function MainControlsContent() {
  const track = useStore(trackStore);
  const trackData = track.data
    ? (track.data.features[0].geometry as LineString)
    : null;
  const resourceView = useStore(resourceViewStore);
  return (
    <>
      <div className="space-y-4 md:mt-0">
        <div className="flex flex-col space-y-4">
          <UploadButton />
          {!track.data && (
            <p className="text text-primary/60">
              Upload your GPX route, and we'll show you handy OSM-based
              stops—like water refill points, coffee spots, and a place to rest
              if you need it. Think of it as your reliable guide for those
              well-deserved breaks along the ride.
            </p>
          )}
        </div>
      </div>
      {track && trackData && (
        <TrackInformation track={track} trackData={trackData} />
      )}
      <TrackEditor resources={resourceView} />
    </>
  );
}
