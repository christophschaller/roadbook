import React, { useEffect } from 'react';
import { Droplet } from "lucide-react"
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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import UploadButton from "@/components/react/UploadButton"
import AreaDefinition from '@/components/react/AreaDefinition';
import { areaStore } from '@/stores/areaStore';

const categories = [
    {
        name: "Primary Sources",
        // TODO: icon
        active: true,
        tags: [
            ["amenity", "drinking_water"],
            //            ["man_made", "water_tap"],
            //            ["natural", "spring"],
        ],
    },
    {
        name: "Secondary Sources",
        // TODO: icon
        active: true,
        tags: [
            ["man_made", "water_well"],
            //           ["man_made", "water_point"],
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
                                        <AreaDefinition
                                            categories={categories}
                                        />
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
