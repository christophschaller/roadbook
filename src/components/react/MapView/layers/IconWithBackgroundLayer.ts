import type { PointOfInterest } from "@/types";
import { CompositeLayer } from "@deck.gl/core";
import type { CompositeLayerProps } from "@deck.gl/core";
import type { Layer } from "@deck.gl/core";
import { ScatterplotLayer, IconLayer } from "@deck.gl/layers";

interface IconWithBackgroundProps extends CompositeLayerProps {
  data: any[];
  getPosition?: (d: any) => [number, number];
  getIcon?: (d: any) => any;
  getSize?: (d: any) => number;
  getColor?: (d: any) => [number, number, number, number];
  getBackgroundRadius?: (d: any) => number;
  getBackgroundColor?: (d: any) => [number, number, number, number];
  getLineColor?: (d: any) => any;
  getLineWidth?: (d: any) => any;
  radiusUnits?: string;
  lineWidthUnits?: string;
  stroked: boolean;
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

    // === Background Circle Props ===
    getBackgroundRadius: { type: "accessor", value: 16 },
    getBackgroundColor: { type: "accessor", value: [255, 255, 255] },
    getLineColor: { type: "accessor", value: [255, 255, 255] },
    getLineWidth: { type: "accessor", value: 0 },
    lineWidthUnits: { type: "accessor", value: "pixels" },
    radiusUnits: { type: "accessor", value: "pixels" },
    stroked: { type: "accessor", value: false },
  };

  renderLayers() {
    const layers: Layer[] = [];

    this.props.data.forEach((d: PointOfInterest, i: number) => {
      // 1) draw background
      layers.push(
        new ScatterplotLayer(
          this.getSubLayerProps({
            id: `background-${i}`,
            data: [d],
            pickable: this.props.pickable,
            visible: this.props.visible,
            radiusUnits: this.props.radiusUnits,
            getPosition: this.props.getPosition,
            getRadius: this.props.getBackgroundRadius,
            getFillColor: this.props.getBackgroundColor,
            getLineColor: this.props.getLineColor,
            getLineWidth: this.props.getLineWidth,
            lineWidthUnits: this.props.lineWidthUnits,
            stroked: this.props.stroked,
          }),
        ),
      );

      // 2) draw text on top of its own background
      layers.push(
        new IconLayer(
          this.getSubLayerProps({
            id: `icon-${i}`,
            data: [d],
            pickable: false,
            visible: this.props.visible,
            getPosition: this.props.getPosition,
            getIcon: this.props.getIcon,
            getSize: this.props.getSize,
            getColor: this.props.getColor,
          }),
        ),
      );
    });

    return layers;
  }
}
