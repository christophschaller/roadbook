import type { PointOfInterest } from "@/types";
import { CompositeLayer } from "@deck.gl/core";
import type { CompositeLayerProps } from "@deck.gl/core";
import { ScatterplotLayer, IconLayer } from "@deck.gl/layers";

interface IconWithBackgroundProps extends CompositeLayerProps {
  data: any[];
  getPosition?: (d: any) => [number, number];
  getIcon?: (d: any) => any;
  getSize?: (d: any) => number;
  getColor?: (d: any) => [number, number, number, number];
  getBackgroundRadius?: (d: any) => number;
  getBackgroundColor?: (d: any) => [number, number, number, number];
  getFilterValue?: (d: any) => any;
  filterRange?: (d: any) => any;
}

export default class IconWithBackgroundLayer extends CompositeLayer<IconWithBackgroundProps> {
  static layerName = "IconWithBackgroundLayer";

  static defaultProps = {
    // === Shared Base Props (inherited by both sublayers) ===
    getPosition: { type: "accessor", value: (x: any) => x.position },
    pickable: { type: "boolean", value: true },
    visible: { type: "boolean", value: true },

    // === IconLayer Props ===
    getIcon: { type: "accessor", value: (d: PointOfInterest) => d.icon }, // expects {url, width, height, mask?}
    getSize: { type: "accessor", value: 24 },
    getColor: { type: "accessor", value: [255, 255, 255] },

    // === DataFilterExtension Props (if used) ===
    getFilterValue: { type: "accessor", value: (x: any) => x.filterValue },
    filterRange: { type: "array", value: [0, 1] as [number, number] },

    // === Background Circle Props ===
    getBackgroundRadius: { type: "accessor", value: 16 },
    getBackgroundColor: { type: "accessor", value: [255, 255, 255] },
  };

  renderLayers() {
    const {
      data,
      getPosition,
      pickable,
      visible,
      getBackgroundRadius,
      getBackgroundColor,
      getIcon,
      getSize,
      getColor,
      // Filter props
      getFilterValue,
      filterRange,
    } = this.props;

    // 1) White circle backgrounds
    const background = new ScatterplotLayer(
      this.getSubLayerProps({
        id: "background",
        data,
        pickable,
        visible,
        radiusUnits: "pixels",
        getPosition,
        getRadius: getBackgroundRadius,
        getFillColor: getBackgroundColor,
        stroked: false,
      }),
    );

    // 2) Icons on top, auto‑packed
    const icons = new IconLayer(
      this.getSubLayerProps({
        id: "icons",
        data,
        pickable: false,
        visible,
        getPosition,
        getIcon,
        getSize,
        getColor,
        getFilterValue,
        filterRange,
        // pass through any extensions or filters automatically
      }),
    );

    return [background, icons];
  }
}
