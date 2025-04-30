import { $selectedTrack, $trackStore } from "@/stores";
import { useStore } from "@nanostores/react";
import { MoveHorizontal, MoveUpRight } from "lucide-react";
import TextToggle from "@/components/ui/textToggle";

export function TrackSelector() {
  const selectedTrack = useStore($selectedTrack);
  const handleOnChange = (value: string) => {
    $selectedTrack.set(value);
  };
  const { data: track, loading: trackLoading, error } = useStore($trackStore);

  return (
    <div className="space-y-2">
      <h2 className="font-medium text-xl">Shardana 2025</h2>
      <div className="pt-2">
        <TextToggle
          options={[
            { value: "shardana_full.json", label: "Long" },
            { value: "shardana_mid.json", label: "Short" },
          ]}
          toggleColor="#522662"
          defaultSelected={selectedTrack}
          onChange={handleOnChange}
        />
      </div>
      <div className="w-full flex justify-between p-1 rounded-xl px-4">
        <div className="flex items-center space-x-2 text-gray-800">
          <MoveHorizontal className="w-5 h-5" />
          <span className="text-gray-800 text-sm">{track?.distance} km</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-800">
          <MoveUpRight className="w-5 h-5" />
          <span className="text-gray-800 text-sm">{track?.altitude} m</span>
        </div>
      </div>
    </div>
  );
}
