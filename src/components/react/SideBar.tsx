import React, { useState } from "react";
import { Droplet } from "lucide-react";
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
} from "@/components/ui/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import UploadButton from "@/components/react/UploadButton";
import AreaDefinition from "@/components/react/AreaDefinition";
import { poiTypes } from "@/lib/data";

const SideBar: React.FC = () => {
  const [activeType, setActiveType] = useState<string>("");

  console.log(activeType);

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
              <Accordion
                type="single"
                collapsible
                value={activeType}
                onValueChange={setActiveType}
              >
                {poiTypes.map((poiType) => (
                  <AccordionItem key={poiType.id} value={poiType.id}>
                    <AccordionTrigger>
                      <SidebarMenuButton asChild>
                        <a href="#">
                          <poiType.icon
                            color={`rgb(${poiType.color.join(",")})`}
                          />
                          <span>{poiType.name}</span>
                        </a>
                      </SidebarMenuButton>
                    </AccordionTrigger>
                    <AccordionContent>
                      <AreaDefinition poiType={poiType} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
};

export default SideBar;
