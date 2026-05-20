import { useIsMobile } from "@/hooks/use-mobile";
import { MainControlsMobile } from "@/components/react/MainControlsBar/MainControlsMobile";
import { MainControlsDesktop } from "@/components/react/MainControlsBar/MainControlsDesktop";

interface MainControlsProps {
  showUpload?: boolean;
}

export function MainControls({ showUpload = true }: MainControlsProps) {
  const isMobile = useIsMobile();

  return isMobile ? (
    <MainControlsMobile showUpload={showUpload} />
  ) : (
    <MainControlsDesktop showUpload={showUpload} />
  );
}
