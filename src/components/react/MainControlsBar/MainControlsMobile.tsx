import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { POISectionMobile } from "@/components/react/MainControlsBar/sections/POISectionMobile";

export function MainControlsMobile() {
  const [isOpen, setIsOpen] = useState(true);

  const handleControlToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 h-1/3 flex items-center justify-center ${isOpen ? "" : "invisible"} transition-opacity duration-300`}
    >
      <POISectionMobile />
      <div
        className={`${isOpen ? "absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-[-40%] z-10" : "fixed bottom-0 left-0 right-0 p-4 px-8"} `}
      >
        <Button
          className="visible w-full rounded-full bg-black/20 backdrop-blur-md border border-white/20 opacity-100 hover:bg-black/30 transition-transform duration-300"
          onClick={handleControlToggle}
        >
          {isOpen ? (
            <ChevronDown size={32} className="w-8 h-8 text-white" />
          ) : (
            <ChevronUp size={32} className="w-8 h-8 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
}
