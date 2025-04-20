import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { resourceViewStore, resourceStateStore } from "@/stores/resourceStore";
import { useStore } from "@nanostores/react";
import type { ResourceView } from "@/types";
import { POISelectorContainer } from "@/components/react/MainControlsBar/POISelectorContainer";

function ResourceContainer({ resource }: { resource: ResourceView }) {
  return (
    <div className="space-y-2">
      <div className="w-full flex items-center space-x-2 p-2 rounded-md hover:bg-white/50 transition-colors">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: `rgb(${resource.color.join(",")})`,
          }}
        >
          <resource.icon className="w-5 h-5" color="white" />
        </div>
        <span className="text-lg text-primary">{resource.name}</span>
      </div>
      <div className="ml-4">
        <POISelectorContainer resource={resource} />
      </div>
    </div>
  );
}

function MobileMenu() {
  const resourceView = useStore(resourceViewStore);
  const resources = Object.values(resourceView);

  const [activeResourceIndex, setActiveResourceIndex] = useState(0);

  const chevronLeftButton = (
    <button
      onClick={() =>
        setActiveResourceIndex(activeResourceIndex - 1)
      }
      disabled={activeResourceIndex === 0}
      className={cn(
        "absolute left-4 z-20 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20",
        activeResourceIndex === 0
          ? "opacity-50 cursor-not-allowed"
          : "opacity-100 hover:bg-black/30",
      )}
    >
      <ChevronLeft className="h-6 w-6 text-white" />
    </button>
  );

  const chevronRightButton = (
    <button
      onClick={() =>
        setActiveResourceIndex(activeResourceIndex + 1)
      }
      disabled={activeResourceIndex === resources.length - 1}
      className={cn(
        "absolute right-4 z-20 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20",
        activeResourceIndex === resources.length - 1
          ? "opacity-50 cursor-not-allowed"
          : "opacity-100 hover:bg-black/30",
      )}
    >
      <ChevronRight className="h-6 w-6 text-white" />
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 h-1/3 overflow-hidden flex items-center justify-center">
      {chevronLeftButton}
      <div className="w-full p-5 m-10 rounded-2xl bg-white/80 backdrop-blur-md">
        <ResourceContainer resource={resources[activeResourceIndex]} />
      </div>
      {chevronRightButton}
    </div>
  );
}

export function MainControlsMobile() {
  return <MobileMenu />;
}
