import type { Rider } from "@/types";
import { CompositeLayer } from "@deck.gl/core";
import type { CompositeLayerProps } from "@deck.gl/core";
import type { Layer } from "@deck.gl/core";
import { ScatterplotLayer, TextLayer } from "@deck.gl/layers";

interface TextWithBackgroundProps extends CompositeLayerProps {
  data: Rider[];
  getPosition?: [number, number] | ((d: any) => [number, number]);
  getText?: string | ((d: any) => string);
  getSize?: number | ((d: any) => number);
  getColor?:
    | [number, number, number, number?]
    | ((d: any) => [number, number, number, number?]);
  getBackgroundRadius?: number | ((d: any) => number);
  getBackgroundColor?:
    | [number, number, number, number?]
    | ((d: any) => [number, number, number, number?]);
  getPixelOffset?: [number, number] | ((d: any) => [number, number]);
  getLineColor?:
    | [number, number, number, number]
    | ((d: any) => [number, number, number, number]);
  getLineWidth?: number | ((d: any) => number);
  getTextAnchor?: string | ((d: any) => string);
  getAlignmentBaseline?: string | ((d: any) => string);
  stroked: boolean;
  fontFamily: string;
  lineWidthUnits?: string;
  radiusUnits?: string;
  sizeUnits?: string;
}

export default class TextWithBackgroundLayer extends CompositeLayer<TextWithBackgroundProps> {
  static layerName = "TextWithBackgroundLayer";

  static defaultProps = {
    // === Shared Base Props (inherited by both sublayers) ===
    getPosition: { type: "accessor", value: (x: any) => x.position },
    pickable: { type: "boolean", value: true },
    visible: { type: "boolean", value: true },

    // === TextLayer Props ===
    getText: { type: "accessor", value: (d: Rider) => d.cap_number },
    getSize: { type: "accessor", value: 24 },
    getColor: { type: "accessor", value: [255, 255, 255] },
    getTextAnchor: { type: "accessor", value: "middle" },
    getAlignmentBaseline: { type: "accessor", value: "center" },
    fontFamily: { type: "accessor", value: "Inter" },
    getPixelOffset: { type: "accessor", value: [0, 0] },

    // === Background Circle Props ===
    getBackgroundRadius: { type: "accessor", value: 16 },
    getBackgroundColor: { type: "accessor", value: [255, 255, 255] },
    getLineColor: { type: "accessor", value: [255, 255, 255] },
    sizeUnits: { type: "accessor", value: "pixels" },
    getLineWidth: { type: "accessor", value: 0 },
    lineWidthUnits: { type: "accessor", value: "pixels" },
    radiusUnits: { type: "accessor", value: "pixels" },
    stroked: { type: "accessor", value: false },
  };

  renderLayers() {
    const layers: Layer[] = [];

    this.props.data.forEach((d: Rider, i: number) => {
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
        new TextLayer(
          this.getSubLayerProps({
            id: `text-${i}`,
            data: [d],
            pickable: false,
            visible: this.props.visible,
            getPosition: this.props.getPosition,
            getText: this.props.getText,
            getSize: this.props.getSize,
            getColor: this.props.getColor,
            getPixelOffset: this.props.getPixelOffset,
            fontFamily: this.props.fontFamily,
          }),
        ),
      );
    });

    return layers;
  }
}
