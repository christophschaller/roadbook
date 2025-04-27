import { CompositeLayer, type UpdateParameters } from "@deck.gl/core";
import { TextLayer, ScatterplotLayer } from "@deck.gl/layers";
import IconWithBackgroundLayer from "./IconWithBackgroundLayer";
import Supercluster from "supercluster";

const DEFAULT_CLUSTER_RADIUS = 40;
const DEFAULT_MIN_ZOOM = 0;
const DEFAULT_MAX_ZOOM = 16;

interface ClusterFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: {
    cluster?: boolean;
    cluster_id?: number;
    point_count?: number;
    [key: string]: any;
  };
}

interface IconClusterLayerProps {
  data: any[];
  getPosition: (d: any) => [number, number];
  getBackgroundRadius?: (d: ClusterFeature) => number;
  getBackgroundColor?: (d: ClusterFeature) => [number, number, number, number];
  onClusterClick?: (info: any, expansionZoom: number) => void;
  clusterRadius?: number;
  minZoom?: number;
  maxZoom?: number;
  clusterLabelSize?: number;
  // ...other IconWithBackgroundLayer props
}

export default class ClusterIconLayer<
  DataT extends { [key: string]: any } = any,
  ExtraProps extends {} = {},
> extends CompositeLayer<IconClusterLayerProps & ExtraProps> {
  static layerName = "ClusterIconLayer";

  static defaultProps = {
    // === Cluster Props ===
    clusterRadius: DEFAULT_CLUSTER_RADIUS,
    minZoom: DEFAULT_MIN_ZOOM,
    maxZoom: DEFAULT_MAX_ZOOM,

    // === Pass through all IconWithBackgroundLayer props ===
    ...IconWithBackgroundLayer.defaultProps,
    onClusterClick: { type: "function", value: null },
    clusterLabelSize: 16,
  };

  initializeState() {
    this.state = {
      clusters: [],
      superCluster: null,
      viewport: null,
    };
  }

  shouldUpdateState({ changeFlags }: UpdateParameters<this>) {
    return changeFlags.somethingChanged;
  }

  private buildSuperCluster(props: IconClusterLayerProps) {
    const superCluster = new Supercluster({
      radius: props.clusterRadius,
      minZoom: props.minZoom,
      maxZoom: props.maxZoom,
    });

    const points = props.data.map((d) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: props.getPosition(d),
      },
      properties: d,
    }));

    superCluster.load(points);
    return superCluster;
  }

  updateState({ props, oldProps, changeFlags }: UpdateParameters<this>) {
    const rebuildIndex =
      changeFlags.dataChanged ||
      props.clusterRadius !== oldProps.clusterRadius ||
      props.minZoom !== oldProps.minZoom ||
      props.maxZoom !== oldProps.maxZoom;

    if (rebuildIndex) {
      const superCluster = this.buildSuperCluster(props);
      this.setState({ superCluster });
    }

    const viewportChanged =
      changeFlags.viewportChanged ||
      (this.state.viewport &&
        this.state.viewport.zoom !== this.context.viewport.zoom);

    if (rebuildIndex || viewportChanged) {
      const viewport = this.context.viewport;
      if (!viewport || typeof viewport.getBounds !== "function") {
        return;
      }
      const bounds = viewport.getBounds();
      const zoom = Math.floor(viewport.zoom);

      const superCluster = this.state.superCluster as Supercluster<any>;
      const clusters = superCluster.getClusters(
        [bounds[0], bounds[1], bounds[2], bounds[3]],
        zoom,
      );

      this.setState({ clusters, viewport });
    }
  }

  renderLayers() {
    const { clusters } = this.state;
    if (!clusters || !Array.isArray(clusters)) return null;

    const { getBackgroundRadius, getBackgroundColor } = this.props;

    const nonClustered = clusters.filter((c) => !c.properties.cluster);
    const clustered = clusters.filter((c) => c.properties.cluster);

    return [
      // Non-clustered points
      new IconWithBackgroundLayer(
        this.getSubLayerProps({
          getPosition: (d) => d.geometry.coordinates,
          ...this.props,
          data: nonClustered.map((c) => c.properties),
        }),
      ),

      // Cluster backgrounds (white circles)
      new ScatterplotLayer(
        this.getSubLayerProps({
          id: "cluster-backgrounds",
          data: clustered,
          pickable: true,
          getPosition: (d) => d.geometry.coordinates,
          radiusUnits: "pixels",
          getRadius: getBackgroundRadius,
          getFillColor: getBackgroundColor,
          stroked: false,
          onClick: (info) => {
            if (this.props.onClusterClick) {
              const cluster = info.object;
              const clusterId = cluster?.properties?.cluster_id;
              if (clusterId !== undefined && clusterId !== null) {
                try {
                  const expansionZoom =
                    (this.state.superCluster as Supercluster<any>).getClusterExpansionZoom(clusterId);
                  this.props.onClusterClick(info, expansionZoom);
                } catch (e) {
                  // Optionally log or handle error
                }
              }
            }
          },
        }),
      ),

      // Cluster numbers
      new TextLayer(
        this.getSubLayerProps({
          id: "cluster-labels",
          data: clustered,
          getPosition: (d) => d.geometry.coordinates,
          getText: (d) => String(d.properties.point_count),
          getSize: this.props.clusterLabelSize,
          sizeUnits: "pixels",
          getTextAnchor: "middle",
          getAlignmentBaseline: "center",
        }),
      ),
    ];
  }
}
