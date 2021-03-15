import { Feature, FeatureCollection, LineString, Polygon } from "@turf/helpers";
export declare class ClusteringTreeNode {
    zoneOfInterest: Feature<Polygon>;
    paths: Feature<LineString>[];
    averagePaths: Feature<LineString>[];
    parent: ClusteringTreeNode | null;
    children: ClusteringTreeNode[];
    constructor(zoneOfInterest: Feature<Polygon>, paths: Feature<LineString>[], parent: ClusteringTreeNode | null, children: ClusteringTreeNode[]);
    toFeatureCollection(): FeatureCollection;
}
