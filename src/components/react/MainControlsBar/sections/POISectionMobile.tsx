import { resourceViewStore } from "@/stores/resourceStore";
import { useStore } from "@nanostores/react";
import { MobileContainerCarousel } from "./MobileContainerCarousel";

export function POISectionMobile() {
  const resourceView = useStore(resourceViewStore);
  const resources = Object.values(resourceView);

  return <MobileContainerCarousel resources={resources} />;
}
