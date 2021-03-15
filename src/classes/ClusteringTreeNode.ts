import {Feature, FeatureCollection, LineString, Polygon} from "@turf/helpers";

export class ClusteringTreeNode {
    zoneOfInterest: Feature<Polygon>;
    paths: Feature<LineString>[];
    averagePaths: Feature<LineString>[];

    parent: ClusteringTreeNode | null;
    children: ClusteringTreeNode[];

    constructor (
        zoneOfInterest: Feature<Polygon>,
        paths: Feature<LineString>[],
        parent: ClusteringTreeNode | null,
        children: ClusteringTreeNode[],
    ) {
        this.zoneOfInterest = zoneOfInterest;
        this.paths = paths;
        this.averagePaths = [];
        this.parent = parent;
        this.children = children;
    }

    public toFeatureCollection (): FeatureCollection {
        return {
            'type': 'FeatureCollection',
            'features': [
                this.zoneOfInterest,
                ...this.paths
            ]
        }
    }
}
