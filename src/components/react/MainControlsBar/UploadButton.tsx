import { Plus, RefreshCw } from "lucide-react";
import { parseGPX } from "@we-gold/gpxjs";
import { Button } from "@/components/ui/button";
import { trackStore } from "@/stores/trackStore";

import { type LineString } from "geojson";
import { resourceStore } from "@/stores/resourceStore";
import { useStore } from "@nanostores/react";
import { fetchOverPassPOIsAlongRoute } from "@/lib/dataFetching/fetchOverPassPOIsAlongRoute";

export default function UploadButton({
  className = "",
}: {
  className?: string;
}) {
  const resources = useStore(resourceStore);

  const track = useStore(trackStore);
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content.includes("<gpx")) {
        const [gpx, err] = parseGPX(content);
        const geojson = gpx?.toGeoJSON();

        if (geojson) {
          trackStore.set({
            name: geojson.properties.name || file.name,
            data: geojson, // Store raw GPX or process into a desired format (e.g., GeoJSON)
          });
          fetchOverPassPOIsAlongRoute({
            resources,
            lineString: geojson.features[0].geometry as LineString,
            bufferMeters: 2500,
          });
        } else {
          console.error(
            "Invalid GPX file. Please ensure it's a valid GPX format.",
          );
        }
      } else {
        console.error(
          "Invalid GPX file. Please ensure it's a valid GPX format.",
        );
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <Button
      variant={track.data ? "outline" : "default"}
      className={`${className} md:w-full`}
      onClick={() => document.getElementById("file-upload")?.click()}
    >
      {track.data ? (
        <RefreshCw className="h-4 w-4 md:mr-2" />
      ) : (
        <Plus className="h-4 w-4 md:mr-2" />
      )}
      <span className="inline">
        {track.data ? "Upload New Track" : "Upload GPX Track"}
      </span>
      <input
        id="file-upload"
        type="file"
        accept=".gpx"
        className="hidden"
        onChange={handleFileChange}
      />
    </Button>
  );
}