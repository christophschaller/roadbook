import { useRef, useEffect, useState } from "react";
import type { PointOfInterest } from "@/types";
import * as LucideIcons from "lucide-react";
import { X, Link, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resourceViewStore } from "@/stores/resourceStore";
import { useStore } from "@nanostores/react";
import {
  addFavorite,
  removeFavorite,
  isFavorite,
} from "@/stores/favoritesStore";

export function PoiTooltip({
  poi,
  viewport,
  onClose,
}: {
  poi: PointOfInterest;
  viewport: any;
  onClose?: () => void;
}) {
  try {
    const ref = useRef<HTMLDivElement>(null);
    const resourceView = useStore(resourceViewStore);
    const [isMobile, setIsMobile] = useState(true);
    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
      if (!poi?.id) {
        console.warn("POI ID is undefined:", poi);
        return;
      }
      const favoriteStatus = isFavorite(poi.id.toString());
      setIsFavorited(favoriteStatus);
    }, [poi?.id]);

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const resource = resourceView[poi.resourceId];
    const resourceCategory = resource.categories[poi.resourceCategoryId];

    // @ts-ignore render error from lucide-react
    const IconComponent = (LucideIcons as any)[
      resourceCategory.icon.render.name
    ];
    const iconColor = Array.isArray(resource.color)
      ? `rgb(${resource.color.join(",")})`
      : resource.color;

    const [x, y] = viewport.project([poi.lon, poi.lat]);

    const handleFavoriteClick = () => {
      if (isFavorited) {
        removeFavorite(poi.id.toString());
      } else {
        addFavorite(poi);
      }
      setIsFavorited(!isFavorited);
    };

    return (
      <div
        ref={ref}
        className={`${
          isMobile
            ? "w-full fixed top-0 left-0 right-0 rounded-b-2xl"
            : "w-128 absolute rounded-2xl"
        } p-4 bg-white/80 backdrop-blur-md transition-transform duration-200`}
        style={{
          zIndex: 10,
          ...(isMobile ? {} : { left: `${x}px`, top: `${y}px` }),
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-shrink-0">
            {IconComponent && (
              <IconComponent className="w-8 h-8" color={iconColor} />
            )}
          </div>
          <div className="flex-grow text-center">
            {poi.name != null && poi.name !== "" && (
              <div className="flex items-center justify-center gap-2">
                {isMobile ? (
                  <h5 className="font-bold text-lg">{poi.name}</h5>
                ) : (
                  <p className="font-bold text-md">{poi.name}</p>
                )}
              </div>
            )}
            <div className="flex items-center justify-center gap-2">
              {poi.phone != null && poi.phone !== "" && (
                <>
                  <span>{poi.phone}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full"
                    asChild
                  >
                    <a
                      href={`tel:${poi.phone.replace(/\s+/g, "")}`}
                      className="flex items-center justify-center"
                    >
                      <Phone className="h-5 w-5" color={iconColor} />
                    </a>
                  </Button>
                </>
              )}
              {poi.website != null && poi.website !== "" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  asChild
                >
                  <a
                    href={
                      poi.website.startsWith("http")
                        ? poi.website
                        : `https://${poi.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                  >
                    <Link className="h-5 w-5" color={iconColor} />
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className={`h-8 w-8 p-0 rounded-full ${
                  isFavorited ? iconColor : ""
                }`}
                onClick={handleFavoriteClick}
              >
                <Star
                  className="h-5 w-5"
                  color={iconColor}
                  fill={isFavorited ? iconColor : "none"}
                />
              </Button>
            </div>
            {(!poi.website || poi.website === "") &&
              (!poi.phone || poi.phone === "") && (
                <p className="font-light text-sm">
                  {resourceCategory.description}
                </p>
              )}
          </div>
          <Button
            type="button"
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 hover:bg-gray-200 focus:outline-none"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-6 h-6 text-black" />
          </Button>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering PoiTooltip:", error);
    return null;
  }
}
