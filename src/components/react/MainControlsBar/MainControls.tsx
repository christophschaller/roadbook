import { useIsMobile } from "@/hooks/use-mobile";
import { MainControlsMobile } from "@/components/react/MainControlsBar/MainControlsMobile";
import { MainControlsDesktop } from "@/components/react/MainControlsBar/MainControlsDesktop";

export function MainControls() {
  const isMobile = useIsMobile();

  return isMobile ? <MainControlsMobile /> : <MainControlsDesktop />;
}
