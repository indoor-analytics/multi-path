import {Feature, lineString, LineString, point, Point, Polygon, Position} from "@turf/helpers";
import {booleanEqual, booleanPointOnLine} from "@turf/turf";


export function getZOIBoundaries (zoneOfInterest: Feature<Polygon>): Feature<LineString>[] {
    const boundaries: Feature<LineString>[] = [];

    for (let i=0, len=zoneOfInterest.geometry!.coordinates[0].length; i<len-1; i++) {
        const coord1: Position = zoneOfInterest.geometry!.coordinates[0][i];
        const coord2: Position = zoneOfInterest.geometry!.coordinates[0][i + 1];
        boundaries.push( lineString([coord1, coord2]) );
    }

    return boundaries;
}


export function getZOIVertexes (zoneOfInterest: Feature<Polygon>): Feature<Point>[] {
    const points: Feature<Point>[] = [];

    for (let i=0, len=zoneOfInterest.geometry!.coordinates[0].length; i<len-1; i++) {
        points.push( point(zoneOfInterest.geometry!.coordinates[0][i]) );
    }

    return points;
}


export function isPointOnZOIBoundaries (point: Position, zoneOfInterest: Feature<Polygon>): boolean {
    const ZOIBoundaries = getZOIBoundaries(zoneOfInterest);

    for (const boundary of ZOIBoundaries)
        if (booleanPointOnLine(point, boundary))
            return true;

    return false;
}


export function isPointAZOIVertex (point: Feature<Point>, zoneOfInterest: Feature<Polygon>): boolean {
    const ZOIVertexes = getZOIVertexes(zoneOfInterest);

    for (const vertex of ZOIVertexes)
        if (booleanEqual(point, vertex))
            return true;

    return false;
}
