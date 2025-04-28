import type { LineString } from "geojson";
import type { Track } from "@/types";

export function TrackInformationSection({
  track,
  trackData,
}: {
  track: Track;
  trackData: LineString;
}) {
  return (
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
  );
}
