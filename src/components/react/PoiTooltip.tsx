import { useRef } from "react";
import type { PointOfInterest } from "@/types";
import * as LucideIcons from "lucide-react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resourceViewStore } from "@/stores/resourceStore";
import { useStore } from "@nanostores/react";

export function PoiTooltip({
  poi,
  style = {},
  onClose,
}: {
  poi: PointOfInterest;
  style?: React.CSSProperties;
  onClose?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const resourceView = useStore(resourceViewStore);

  const resource = resourceView[poi.resourceId];
  const resourceCategory = resource.categories[poi.resourceCategoryId];

  const IconComponent = (LucideIcons as any)[resourceCategory.icon.render.name];
  const iconColor = Array.isArray(resource.color)
    ? `rgb(${resource.color.join(",")})`
    : resource.color;

  return (
    <div
      ref={ref}
      className="absolute w-full md:w-64 md:left-[50px] md:top-[50px] bg-white/80 backdrop-blur-md shadow-lg p-4 rounded-t-2xl md:rounded-2xl transition-transform duration-200"
      style={{
        position: "absolute",
        zIndex: 1,
        pointerEvents: "auto",
        ...style,
      }}
    >
      <Button
        type="button"
        className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 hover:bg-gray-200 focus:outline-none"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="w-8 h-8 text-black" />
      </Button>
      <div className="absolute top-2 left-2">
        {IconComponent && (
          <IconComponent className="w-8 h-8" color={iconColor} />
        )}
      </div>
      <div className="pt-10 space-y-2">
        {poi.name != null && poi.name !== "" && (
          <p className="justify-self-center text-center font-medium text-lg">
            {poi.name}
          </p>
        )}
        {poi.website != null && poi.website !== "" && (
          <div>
            <a
              href={
                poi.website.startsWith("http")
                  ? poi.website
                  : `https://${poi.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline break-all"
            >
              {poi.website}
            </a>
          </div>
        )}
        {poi.phone != null && poi.phone !== "" && <p>{poi.phone}</p>}
        <p className="font-light text-sm">{resourceCategory.description}</p>
      </div>
    </div>
  );
}
