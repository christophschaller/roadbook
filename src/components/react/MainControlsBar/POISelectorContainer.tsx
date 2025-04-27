import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { poiStore } from "@/stores/poiStore";
import type { PointOfInterest } from "@/types";
import { IconSwitch } from "@/components/ui/IconSwitch";

export function POISelectorContainer({
  resource,
  onDistanceChange,
}: {
  resource: PointOfInterest;
  onDistanceChange?: (distance: number) => void;
}) {
  const stepDistance = 50; // TODO: define in Resource
  const handleSliderChange = (value: number) => {
    const distance = value;
    const currentStore = poiStore.get();
    if (currentStore.pois) {
      const updatedPois = currentStore.pois.map((poi) =>
        poi.id === resource.id ? { ...poi, trackDistance: distance } : poi,
      );
      poiStore.set({ pois: updatedPois });
    }
    onDistanceChange?.(distance);
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <Slider
          defaultValue={[500]}
          min={0}
          max={2500}
          step={stepDistance}
          onValueChange={(value) => {
            handleSliderChange(value[0]);
          }}
        />
        <Label className="text-base md:text-sm">Distance</Label>
      </div>
      <Separator />
      <div className="py-1">
        <div className="flex items-center space-x-2 py-1">
          <IconSwitch
            checked={true}
            onChange={() => {}}
            icon={resource.icon}
            color={resource.color}
          />
          <Label className="text-base md:text-sm">{resource.category}</Label>
        </div>
      </div>
    </>
  );
}
