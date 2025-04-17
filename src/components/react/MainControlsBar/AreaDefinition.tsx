import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { areaStore } from "@/stores/areaStore";
import type { ResourceCategory, Resource } from "@/types";
import { IconSwitch } from "../../ui/IconSwitch";

export function POISelectorContainer({
  resource,
  onDistanceChange,
  onCategoryChange,
}: {
  resource: Resource;
  onDistanceChange?: (distance: number) => void;
  onCategoryChange?: (categories: ResourceCategory[]) => void;
}) {
  const stepDistance = 50;
  const [categoryData, setCategoryData] = useState<{ [key: string]: ResourceCategory }>(
    resource.categories,
  );

  const handleSliderChange = (value: number) => {
    const distance = value;
    const currentStore = areaStore.get();
    areaStore.set({
      ...currentStore,
      ResourceMap: {
        ...currentStore.ResourceMap,
        [resource.id]: {
          ...currentStore.ResourceMap[resource.id],
          distance,
        },
      },
    });
    onDistanceChange?.(distance);
  };

  const handleOnCheckedChange = (catId: string, checked: boolean) => {
    setCategoryData((prevData) => {
      const updatedData = {
        ...prevData,
        [catId]: { ...prevData[catId], active: checked },
      };

      // Compute activeCategories based on updated data
      const activeTags = Object.values(updatedData)
        .filter((cat) => cat.active)
        .map((cat) => cat.id);

      const currentStore = areaStore.get();
      areaStore.set({
        ...currentStore,
        ResourceMap: {
          ...currentStore.ResourceMap,
          [resource.id]: {
            ...currentStore.ResourceMap[resource.id],
            categories: updatedData,
          },
        },
      });

      onCategoryChange?.(Object.values(updatedData));
      return updatedData;
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
        {Object.entries(categoryData).map(([id, cat]) => (
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
