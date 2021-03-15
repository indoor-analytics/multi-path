import { Feature, LineString, Polygon, Position } from '@turf/helpers';
import { ClusteringTreeNode } from "../classes/ClusteringTreeNode";
/**
 * Truncates paths regarding a zone of interest.
 *
 * @param zoneOfInterest target polygon
 * @param paths array of trajectories
 */
export declare function buildZOI(zoneOfInterest: Feature<Polygon>, paths: Feature<LineString>[]): ClusteringTreeNode;
/**
 * Tells if a position is contained in a zone.
 * This is the case if the position is strictly inside the polygon, on one of its segments or nodes.
 *
 * It appears that some positions on ZOI boundaries are not part of associated polygon according to
 * turf.js, hence strange return case (see https://jsfiddle.net/zpebq4xc/2/).
 *
 * @param position location to check
 * @param zoneOfInterest container polygon
 */
export declare function isPositionInsideZOI(position: Position, zoneOfInterest: Feature<Polygon>): boolean;
/**
 * Marks the path with attributes showing if it contains locations marking ZOI entrance or exit.
 * All path locations must be included in ZOI.
 *
 * @param path
 * @param zoneOfInterest
 */
export declare function addWaysToPath(path: Feature<LineString>, zoneOfInterest: Feature<Polygon>): Feature<LineString>;
/**
 * Computes the entry point of a path into a zone.
 * The zone of interest must be a "simple" polygon, that is must not intersect more than once the input segment.
 *
 * @param zoneOfInterest target polygon
 * @param insidePosition position inside zone
 * @param outsidePosition position outside zone
 */
export declare function getZOIIntersectionPosition(zoneOfInterest: Feature<Polygon>, insidePosition: Position, outsidePosition: Position): Position;
/**
 * Computes intersections between a segment and a polygon's boundaries.
 *
 * @param firstPosition input position
 * @param secondPosition input position
 * @param polygon area to check against for collisions
 */
export declare function getPolygonIntersections(firstPosition: Position, secondPosition: Position, polygon: Feature<Polygon>): Position[];
/**
 * Splits a node into four equal nodes (area-wise).
 *
 * @param node node to split
 */
export declare function splitNode(node: ClusteringTreeNode): ClusteringTreeNode[];
