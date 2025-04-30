import { CompositeLayer, type UpdateParameters } from "@deck.gl/core";
import IconWithBackgroundLayer from "./IconWithBackgroundLayer";
import TextWithBackgroundLayer from "./TextWithBackgroundLayer";
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
  getBackgroundRadius?: (d: any) => number;
  getBackgroundColor?: (d: any) => [number, number, number, number?];
  getLineColor?: any;
  getLineWidth?: any;
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

      const clustersWithBBox = clusters.map((cluster) => {
        if (cluster.properties.cluster) {
          const leaves = superCluster.getLeaves(
            cluster.properties.cluster_id,
            Infinity,
          );
          const lats = leaves.map((leaf) => leaf.geometry.coordinates[1]);
          const lngs = leaves.map((leaf) => leaf.geometry.coordinates[0]);
          const bbox = [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ];
          return {
            ...cluster,
            properties: {
              ...cluster.properties,
              bbox,
            },
          };
        }
        return cluster;
      });

      this.setState({ clusters: clustersWithBBox, viewport });
    }
  }

  renderLayers() {
    const { clusters } = this.state;
    if (!clusters || !Array.isArray(clusters)) return null;

    const {
      getBackgroundRadius,
      getBackgroundColor,
      getLineColor,
      getLineWidth,
    } = this.props;

    const nonClustered = clusters.filter((c) => !c.properties.cluster);
    const clustered = clusters.filter((c) => c.properties.cluster);

    return [
      // Non-clustered points
      new IconWithBackgroundLayer(
        this.getSubLayerProps({
          ...this.props,
          data: nonClustered.map((c) => c.properties),
        }),
      ),

      new TextWithBackgroundLayer({
        id: "clusters",
        data: clustered,
        getPosition: (d) => d.geometry.coordinates,
        getText: (d) => String(d.properties.point_count),
        getBackgroundRadius: getBackgroundRadius,
        getSize: this.props.clusterLabelSize,
        getBackgroundColor: getBackgroundColor,
        sizeUnits: "pixels",
        getTextAnchor: "middle",
        getAlignmentBaseline: "center",
        radiusUnits: "pixels",
        pickable: true,
        stroked: false,
        getPixelOffset: [0, 1],
        getColor: [0, 0, 0],
        fontFamily: "Inter",
      }),
    ];
  }
}
