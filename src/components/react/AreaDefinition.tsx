import React, { useState, useEffect } from "react";
import { type LucideIcon, icons } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { areaStore } from "@/stores/areaStore";
import type { Category, PoiType } from "@/types";

export interface AreaDefinitionProps {
  poiType: PoiType; // Type of POI
  onDistanceChange?: (distance: number) => void;
  onCategoryChange?: (categories: Category[]) => void;
}

const AreaDefinition: React.FC<AreaDefinitionProps> = ({
  poiType,
  onDistanceChange,
  onCategoryChange,
}) => {
  const stepDistance = 50;
  const [categoryData, setCategoryData] = useState<{ [key: string]: Category }>(
    poiType.categories,
  );

  const handleSliderChange = (value: number) => {
    const distance = value;
    const currentStore = areaStore.get();
    areaStore.set({
      ...currentStore,
      poiTypeMap: {
        ...currentStore.poiTypeMap,
        [poiType.id]: {
          ...currentStore.poiTypeMap[poiType.id],
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
        poiTypeMap: {
          ...currentStore.poiTypeMap,
          [poiType.id]: {
            ...currentStore.poiTypeMap[poiType.id],
            categories: updatedData,
          },
        },
      });

      onCategoryChange?.(Object.values(updatedData));
      return updatedData;
    });
  };

  return (
    <div className="p-2">
      <div className="flex items-center space-x-2 py-2">
        <Slider
          defaultValue={[poiType.distance]}
          min={poiType.minDistance}
          max={poiType.maxDistance}
          step={stepDistance}
          onValueChange={(value) => {
            handleSliderChange(value[0]);
          }}
        />
        <Label>Distance</Label>
      </div>
      <Separator />
      <div className="py-2">
        {Object.entries(categoryData).map(([id, cat]) => (
          <div className="flex items-center space-x-2 py-2" key={id}>
            <cat.icon color={`rgb(${poiType.color.join(",")})`} />
            <Switch
              id={cat.name}
              checked={cat.active}
              onCheckedChange={(checked) => handleOnCheckedChange(id, checked)}
            />
            <Label>{cat.name}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AreaDefinition;
