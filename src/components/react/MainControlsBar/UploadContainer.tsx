import { useStore } from "@nanostores/react";
import UploadButton from "./UploadButton";
import { trackStore } from "@/stores/trackStore";

export function UploadContainer() {
  const track = useStore(trackStore);
  return (
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
  );
}

