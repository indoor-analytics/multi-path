import { Feature, LineString, Point, Polygon, Position } from "@turf/helpers";
export declare function getZOIBoundaries(zoneOfInterest: Feature<Polygon>): Feature<LineString>[];
export declare function getZOIVertexes(zoneOfInterest: Feature<Polygon>): Feature<Point>[];
export declare function isPointOnZOIBoundaries(point: Position, zoneOfInterest: Feature<Polygon>): boolean;
export declare function isPointAZOIVertex(point: Feature<Point>, zoneOfInterest: Feature<Polygon>): boolean;
