import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider"
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from "@/components/ui/label"
import { areaStore } from '@/stores/areaStore';
import type { Category } from '@/types';

export interface AreaDefinitionProps {
    categories: Category[]; // List of categories to display
    minDistance?: number; // slider min
    maxDistance?: number; // slider max
    stepDistance?: number; // slider step
    initialDistance?: number; // slider start
    onDistanceChange?: (distance: number) => void;
    onCategoryChange?: (categories: Category[]) => void;
}

const AreaDefinition: React.FC<AreaDefinitionProps> = ({
    categories,
    minDistance = 500,
    maxDistance = 2500,
    stepDistance = 50,
    initialDistance = 500,
    onDistanceChange,
    onCategoryChange,
}) => {
    const [categoryData, setCategoryData] = useState<Category[]>(categories)


    const handleSliderChange = (value: number) => {
        const distance = value;
        areaStore.set({
            ...areaStore.get(),
            distance,
        });
        onDistanceChange?.(distance);
    };

    const handleOnCheckedChange = (index: number, checked: boolean) => {
        setCategoryData(prevData => {
            const updatedData = prevData.map((cat, i) =>
                i === index ? { ...cat, active: checked } : cat
            );

            // Compute activeCategories based on updated data
            const activeTags = updatedData
                .filter(cat => cat.active)
                .map(cat => cat.id);

            areaStore.set({
                ...areaStore.get(),
                activeTags: activeTags,
            });

            onCategoryChange?.(updatedData);
            return updatedData;
        });
    };

    return (
        <div className='p-2'>
            <div className="flex items-center space-x-2 py-2">
                <Slider
                    defaultValue={[initialDistance]}
                    min={minDistance}
                    max={maxDistance}
                    step={stepDistance}
                    onValueChange={(value) => { handleSliderChange(value[0]) }}
                />
                <Label>Distance</Label>
            </div>
            <Separator />
            <div className='py-2'>
                {categoryData.map((cat, index) => (
                    < div className="flex items-center space-x-2 py-2">
                        <Switch
                            id={cat.name}
                            checked={cat.active}
                            onCheckedChange={(checked) => handleOnCheckedChange(index, checked)}
                        />
                        <Label>{cat.name}</Label>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AreaDefinition;
