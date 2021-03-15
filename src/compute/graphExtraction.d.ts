import { Feature, LineString, Point } from "@turf/helpers";
import { ClusteringTreeNode } from "../classes/ClusteringTreeNode";
/**
 * Returns average paths for a zone of interest.
 * Path are made of two locations, entrance average and exit average position.
 *
 * @param node
 */
export declare function extractAveragePaths(node: ClusteringTreeNode): Feature<LineString>[];
/**
 * These type and interface allow to map each one of a zone of interest's boundaries
 * to associated entrance and exit locations.
 * Boundary identifier is obtained via a call to getFeatureId method.
 */
export declare type ZOIFeaturesToLocations = {
    [boundaryId: string]: extractionZOIFeature;
};
interface extractionZOIFeature {
    entrance: Feature<Point> | null;
    exit: Feature<Point> | null;
}
/**
 * Returns a map linking a zone of interest's features (boundaries and vertexes) to
 * associated entrance and exit locations.
 *
 * @param node
 */
export declare function extractEntrancesAndExits(node: ClusteringTreeNode): ZOIFeaturesToLocations;
export {};
