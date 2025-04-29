import { useStore } from "@nanostores/react";
import { resourceViewStore } from "@/stores/resourceStore";
import { POISectionDesktop } from "@/components/react/MainControlsBar/sections/POISectionDesktop";
import { TrackSelector } from "@/components/react/MainControlsBar/sections/TrackSelector";
import { RiderSectionDesktop } from "./sections/RiderSectionDesktop";
import { Separator } from "@/components/ui/separator";

export function MainControlsDesktop() {
  const resourceView = useStore(resourceViewStore);
  return (
    <div className="absolute bottom-0 left-0 w-full md:w-64 md:left-[50px] md:top-[50px] md:h-[calc(100%-100px)] bg-white/80 backdrop-blur-md shadow-lg p-4 overflow-y-auto rounded-t-2xl md:rounded-2xl transition-transform duration-200">
      <div className="flex flex-col space-y-4">
        <TrackSelector />
        <Separator />
        <POISectionDesktop resources={resourceView} />
        <Separator />
        <RiderSectionDesktop />
      </div>
    </div>
  );
}
