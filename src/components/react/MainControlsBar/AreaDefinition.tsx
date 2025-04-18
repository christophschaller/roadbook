import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { resourceStateStore } from "@/stores/resourceStore";
import type { ResourceCategory, ResourceView } from "@/types";
import { IconSwitch } from "../../ui/IconSwitch";

export function POISelectorContainer({
  resource,
  onDistanceChange,
  onCategoryChange,
}: {
  resource: ResourceView;
  onDistanceChange?: (distance: number) => void;
  onCategoryChange?: (categories: ResourceCategory[]) => void;
}) {
  const stepDistance = 50; // TODO: define in Resource
  const handleSliderChange = (value: number) => {
    const distance = value;
    const currentStore = resourceStateStore.get();
    resourceStateStore.set({
      ...currentStore,
      [resource.id]: {
        ...currentStore[resource.id],
        distance,
      },
    });
    onDistanceChange?.(distance);
  };

  const handleOnCheckedChange = (catId: string, checked: boolean) => {
    const currentStore = resourceStateStore.get();
    resourceStateStore.set({
      ...currentStore,
      [resource.id]: {
        ...currentStore[resource.id],
        categoryStates: {
          ...currentStore[resource.id].categoryStates,
          [catId]: {
            ...currentStore[resource.id].categoryStates[catId],
            active: checked,
          },
        },
      },
    });
  };

  return (
    <div className="pl-2">
      <div className="flex items-center space-x-2">
        <Slider
          defaultValue={[resource.distance]}
          min={resource.minDistance}
          max={resource.maxDistance}
          step={stepDistance}
          onValueChange={(value) => {
            handleSliderChange(value[0]);
          }}
        />
        <Label className="text-base md:text-sm">Distance</Label>
      </div>
      <Separator />
      <div className="py-1">
        {Object.entries(resource.categories).map(([id, cat]) => (
          <div className="flex items-center space-x-2 py-1" key={id}>
            <IconSwitch
              checked={cat.active}
              onChange={(checked: boolean) =>
                handleOnCheckedChange(id, checked)
              }
              icon={cat.icon}
              color={resource.color}
            />
            <Label className="text-base md:text-sm">{cat.name}</Label>
          </div>
        ))}
      </div>
    </div>
  );
}
