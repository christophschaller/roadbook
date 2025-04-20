import type { LineString } from "geojson";
import { trackStore } from "@/stores/trackStore";
import { useStore } from "@nanostores/react";
import { resourceViewStore } from "@/stores/resourceStore";
import { TrackEditor } from "@/components/react/MainControlsBar/TrackEditor";
import { TrackInformation } from "@/components/react/MainControlsBar/TrackInformation";
import { UploadContainer } from "@/components/react/MainControlsBar/UploadContainer";

export function MainControlsDesktop() {
  const track = useStore(trackStore);
  const trackData = track.data
    ? (track.data.features[0].geometry as LineString)
    : null;
  const resourceView = useStore(resourceViewStore);
  return (
    <div className="absolute bottom-0 left-0 w-full md:w-64 md:left-[50px] md:top-[50px] md:h-[calc(100%-100px)] bg-white/80 backdrop-blur-md shadow-lg p-4 overflow-y-auto rounded-t-2xl md:rounded-2xl transition-transform duration-200">
      <div className="flex flex-col space-y-4">
      <UploadContainer />
      {trackData && <TrackInformation track={track} trackData={trackData} />}
      <TrackEditor resources={resourceView} />
    </div>
    </div>
  );
}