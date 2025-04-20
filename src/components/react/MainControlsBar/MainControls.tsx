import { useIsMobile } from "@/hooks/use-mobile";
import { MainControlsMobile } from "./MainControlsMobile";
import { MainControlsDesktop } from "./MainControlsDesktop";

export function MainControls() {
  const isMobile = useIsMobile();

  return isMobile ? <MainControlsMobile /> : <MainControlsDesktop />;
}
