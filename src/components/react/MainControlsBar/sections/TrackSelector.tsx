import { $selectedTrack } from "@/stores/trackStore";
import { MoveHorizontal, MoveUpRight } from "lucide-react";
import TextToggle from "@/components/ui/textToggle";

export function TrackSelector() {
  const handleOnChange = (value: string) => {
    $selectedTrack.set(value);
  };

  return (
    <div className="space-y-2">
      <h2 className="font-medium text-xl">Shardana 2025</h2>
      <div className="space-y-2">
        <TextToggle
          options={[
            { value: "shardana_full.json", label: "Long" },
            { value: "shardana_mid.json", label: "Short" },
          ]}
          backgroundColor="#e5e7eb"
          toggleColor="#008000" // 0, 128, 0 -> sleep color
          defaultSelected="yes"
          onChange={handleOnChange}
        />
      </div>
      <div className="w-full flex justify-between p-1 rounded-xl">
        <div className="flex items-center space-x-2 text-gray-800">
          <MoveHorizontal className="w-5 h-5" />
          <span className="text-gray-800 text-sm">1000 km</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-800">
          <MoveUpRight className="w-5 h-5" />
          <span className="text-gray-800 text-sm">16000 m</span>
        </div>
      </div>
    </div>
  );
}
