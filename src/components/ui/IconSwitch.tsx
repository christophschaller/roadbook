import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface IconSwitchProps
  extends React.ComponentPropsWithoutRef<typeof Switch> {
  icon?: string;
  color?: number[];
}

export const IconSwitch = React.forwardRef<
  React.ElementRef<typeof Switch>,
  IconSwitchProps
>(({ className, icon, color, ...props }, ref) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch ref={ref} className={cn(className)} {...props} />
      {icon && (
        <div
          className="w-5 h-5"
          style={{
            backgroundColor: color ? `rgb(${color.join(",")})` : undefined,
          }}
        >
          <img src={icon} alt="icon" className="w-full h-full" />
        </div>
      )}
    </div>
  );
});

IconSwitch.displayName = "IconSwitch";
