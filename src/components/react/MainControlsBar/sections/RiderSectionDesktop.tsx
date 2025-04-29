import "maplibre-gl/dist/maplibre-gl.css";
import { useStore } from "@nanostores/react";
import { Label } from "@/components/ui/label";
import { $displayRiders, $riderStore } from "@/stores";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconSwitch } from "@/components/ui/IconSwitch";
import { Bike } from "lucide-react";
import type { Rider } from "@/types";

export function RiderSectionDesktop() {
  const displayRiders = useStore($displayRiders);
  const { data: riders, loading: ridersLoading } = useStore($riderStore);

  const handleOnCheckedChange = (checked: boolean) => {
    $displayRiders.set(checked);
  };

  return (
    <div className="space-y-4 md:mt-0">
      <div className="space-y-2">
        <h3 className="font-medium text-lg md:text-base text-primary">
          Riders
        </h3>
        <div className="mx-2">
          <div className="flex items-center space-x-2 py-1">
            <IconSwitch
              checked={Boolean(riders && displayRiders)}
              onChange={(checked: boolean) => handleOnCheckedChange(checked)}
              icon={Bike}
              color={[0, 0, 0]}
            />
            <Label className="text-base md:text-sm">Show Riders</Label>
          </div>
        </div>
        {riders && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riders &&
                Object.values(riders).map((rider: Rider) => (
                  <TableRow key={rider.tid}>
                    <TableCell className="font-medium">
                      {rider.cap_number}
                    </TableCell>
                    <TableCell>{rider.display_name}</TableCell>
                    <TableCell>{rider.isotst}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
