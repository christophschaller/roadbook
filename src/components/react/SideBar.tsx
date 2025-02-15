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
import { poiTypes } from '@/lib/data';

const SideBar: React.FC = () => {

    // useEffect(() => {
    //     const activeTags = categories
    //         .filter(cat => cat.active) // Filter active categories
    //         .flatMap(cat => cat.tags) // Extract tags arrays
    //         .map(tag => `${tag[0]}_${tag[1]}`); // Concatenate each tag

    //     areaStore.set({
    //         ...areaStore.get(),
    //         activeTags: activeTags,
    //     });
    // }, [categories]);

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
                                {poiTypes.map((poiType, index) => (
                                    <AccordionItem key={`accordion-item-${index}`} value={`item-${index}`}>
                                        <AccordionTrigger>
                                            <SidebarMenuButton asChild>
                                                <a href="#">
                                                    <poiType.icon color={`rgb(${poiType.color.join(',')})`} />
                                                    <span >{poiType.name}</span>
                                                </a>
                                            </SidebarMenuButton>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <AreaDefinition
                                                categories={poiType.categories}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider >
    )
}

export default SideBar;
