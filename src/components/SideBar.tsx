import React, { useState, useEffect } from 'react';
import { Droplet, type LucideIcon } from "lucide-react"
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenuButton,
    SidebarSeparator,
    SidebarRail,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { Slider } from "@/components/ui/slider"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Switch } from './ui/switch';
import { Label } from "@/components/ui/label"
import UploadButton from "@/components/UploadButton"
import { areaStore } from '@/stores/areaStore';
import { Separator } from './ui/separator';

interface Category {
    name: string,
    icon?: LucideIcon,
    active: boolean,
    tags: string[][]
}

const categories = [
    {
        name: "Primary Sources",
        // TODO: icon
        active: true,
        tags: [
            ["amenity", "drinking_water"],
            ["man_made", "water_tap"],
            ["natural", "spring"],
        ],
    },
    {
        name: "Secondary Sources",
        // TODO: icon
        active: true,
        tags: [
            ["man_made", "water_well"],
            ["man_made", "water_point"],
        ],
    },
    {
        name: "Tertiary Sources",
        // TODO: icon
        active: true,
        tags: [
            ["amenity", "toilets"],
        ],
    },
]

const SideBar: React.FC = () => {
    const [categoryData, setCategoryData] = useState<Category[]>(categories)

    useEffect(() => {
        const activeTags = categories
            .filter(cat => cat.active) // Filter active categories
            .flatMap(cat => cat.tags) // Extract tags arrays
            .map(tag => `${tag[0]}_${tag[1]}`); // Concatenate each tag

        areaStore.set({
            ...areaStore.get(),
            activeTags: activeTags,
        });
    }, [categories]);

    const handleSliderChange = (value: number) => {
        areaStore.set({
            ...areaStore.get(),
            distance: value,
        });
    };

    const handleOnCheckedChange = (index: number, checked: boolean) => {
        setCategoryData(prevData => {
            const updatedData = prevData.map((cat, i) =>
                i === index ? { ...cat, active: checked } : cat
            );

            // Compute activeCategories based on updated data
            const activeTags = updatedData
                .filter(cat => cat.active) // Filter active categories
                .flatMap(cat => cat.tags) // Extract tags arrays
                .map(tag => `${tag[0]}_${tag[1]}`); // Concatenate each tag

            areaStore.set({
                ...areaStore.get(),
                activeTags: activeTags,
            });

            return updatedData;
        });
    };

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarRail />
                <SidebarHeader>
                    <UploadButton />
                </SidebarHeader>
                <SidebarSeparator />
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Points of Interest</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <Accordion type="single" collapsible>
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>
                                        <SidebarMenuButton asChild>
                                            <a href="#">
                                                <Droplet color='blue' />
                                                <span>Water</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className='p-2'>
                                            <div className="flex items-center space-x-2 py-2">
                                                <Slider
                                                    defaultValue={[500]}
                                                    min={500}
                                                    max={2500}
                                                    step={50}
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
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider >
    )
}

export default SideBar;
