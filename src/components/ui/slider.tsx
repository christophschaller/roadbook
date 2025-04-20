import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    color?: [number, number, number];
  }
>(({ className, color = [107, 114, 128], ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className="relative h-6 w-full grow overflow-hidden rounded-full bg-gray-200"
      style={{
        backgroundColor: `rgb(${color.join(",")})20`,
      }}
    >
      <SliderPrimitive.Range
        className="absolute h-full px-2"
        style={{
          backgroundColor: `rgb(${color.join(",")})`,
        }}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block h-6 w-6 rounded-full bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      style={{
        border: `2px solid rgb(${color.join(",")})`,
      }}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
