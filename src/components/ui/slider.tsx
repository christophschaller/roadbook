import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, "color"> & {
    color?: [number, number, number];
  }
>(
  (
    {
      className,
      color = [107, 114, 128],
      value: controlledValue,
      defaultValue,
      onValueChange,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = React.useState<number[]>(
      controlledValue ?? defaultValue ?? [0],
    );

    const handleValueChange = (val: number[]) => {
      setValue(val);
      onValueChange?.(val);
    };

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className,
        )}
        value={controlledValue ?? value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
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
          className="flex items-center justify-center h-8 w-12 rounded-full bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          style={{
            border: `2px solid rgb(${color.join(",")})`,
          }}
        >
          <span className="text-xs font-medium text-gray-700 select-none">
            {value[0]}
          </span>
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    );
  },
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
