import {
    Feature,
    FeatureCollection,
    LineString,
    lineString,
    Point,
    polygon,
    Polygon,
    Position
} from '@turf/helpers';
import {bbox, bboxPolygon, booleanPointInPolygon, center, length, lineIntersect, lineSlice} from "@turf/turf";
import {ClusteringTreeNode} from "../classes/ClusteringTreeNode";
import {isPointOnZOIBoundaries} from "./zoiUtils";

/**
 * Truncates paths regarding a zone of interest.
 *
 * @param zoneOfInterest target polygon
 * @param paths array of trajectories
 */
export function buildZOI (
    zoneOfInterest: Feature<Polygon>,
    paths: Feature<LineString>[]
) : ClusteringTreeNode {

    const truncatedPaths: Feature<LineString>[] = [];

    for (const path of paths) {
        let finalPositions: Position[] = [];
        const positionsCount: number = path.geometry!.coordinates.length;

        for (const [index, currentPosition] of path.geometry!.coordinates.entries()) {
            const nextPosition = path.geometry!.coordinates[index+1];

            // current point is inside ZOI
            if (isPositionInsideZOI(currentPosition, zoneOfInterest)) {
                if ((index === positionsCount-1) || isPositionInsideZOI(nextPosition, zoneOfInterest)) {
                    finalPositions.push( currentPosition );
                }

                // if next position is outside ZOI, save current path
                else {
                    finalPositions.push( currentPosition );
                    finalPositions.push (
                        getZOIIntersectionPosition(zoneOfInterest, currentPosition, nextPosition)
                    );

                    truncatedPaths.push (
                        lineString(finalPositions)
                    );
                    finalPositions = [];
                }
            }

            // next point is inside ZOI
            else if ((index !== positionsCount-1) && isPositionInsideZOI(nextPosition, zoneOfInterest)) {
                finalPositions.push (
                    getZOIIntersectionPosition(zoneOfInterest, nextPosition, currentPosition)
                );
            }

            // if path is made of outside points only
            else if (index !== positionsCount-1
                && !isPositionInsideZOI(currentPosition, zoneOfInterest)
                && !isPositionInsideZOI(nextPosition, zoneOfInterest)) {

                const intersectPositions = getPolygonIntersections(currentPosition, nextPosition, zoneOfInterest);

                if (intersectPositions.length === 2) {
                    const pathOrigin = path.geometry!.coordinates[0];
                    const distanceToOrigin1 = length(lineSlice(pathOrigin, intersectPositions[0], path));
                    const distanceToOrigin2 = length(lineSlice(pathOrigin, intersectPositions[1], path));

                    truncatedPaths.push (
                        distanceToOrigin1 < distanceToOrigin2
                            ? lineString(intersectPositions)
                            : lineString(intersectPositions.reverse())
                    );
                }
            }
        }

        // not saving the path if it doesn't feature any position
        if (finalPositions.length !== 0) {
            truncatedPaths.push (
                lineString(finalPositions)
            );
        }
    }

    return new ClusteringTreeNode(
        zoneOfInterest,
        truncatedPaths.map((path) => addWaysToPath(path, zoneOfInterest)),
        null, []);
}

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
export function isPositionInsideZOI (
    position: Position,
    zoneOfInterest: Feature<Polygon>
) : boolean {
    return isPointOnZOIBoundaries(position, zoneOfInterest) || booleanPointInPolygon(position, zoneOfInterest);
}


/**
 * Marks the path with attributes showing if it contains locations marking ZOI entrance or exit.
 * All path locations must be included in ZOI.
 *
 * @param path
 * @param zoneOfInterest
 */
export function addWaysToPath (
    path: Feature<LineString>,
    zoneOfInterest: Feature<Polygon>
) : Feature<LineString> {

    for (const position of path.geometry!.coordinates) {
        if (!isPositionInsideZOI(position, zoneOfInterest)) {
            throw new RangeError('All path locations must be strictly included in the zone of interest.');
        }
    }

    // cloning input path
    const newPath = lineString([...path.geometry!.coordinates]);

    const firstPosition = newPath.geometry!.coordinates[0];
    const lastPosition = newPath.geometry!.coordinates[newPath.geometry!.coordinates.length-1];

    newPath.properties!.hasZOIentrance = isPointOnZOIBoundaries(firstPosition, zoneOfInterest);
    newPath.properties!.hasZOIexit = isPointOnZOIBoundaries(lastPosition, zoneOfInterest);

    return newPath;
}


/**
 * Computes the entry point of a path into a zone.
 * The zone of interest must be a "simple" polygon, that is must not intersect more than once the input segment.
 *
 * @param zoneOfInterest target polygon
 * @param insidePosition position inside zone
 * @param outsidePosition position outside zone
 */
export function getZOIIntersectionPosition (
    zoneOfInterest: Feature<Polygon>,
    insidePosition: Position,
    outsidePosition: Position
) : Position {
    const insidePosIsInsideZOI = isPositionInsideZOI(insidePosition, zoneOfInterest);
    const outsidePosIsInsideZOI = isPositionInsideZOI(outsidePosition, zoneOfInterest);

    if (insidePosIsInsideZOI && outsidePosIsInsideZOI)
        throw new RangeError('Both positions must not be located inside the zone of interest.');
    else if (!insidePosIsInsideZOI && !outsidePosIsInsideZOI)
        throw new RangeError('Both positions must not be located outside the zone of interest.');

    let intersectPositions: Position[] = getPolygonIntersections(insidePosition, outsidePosition, zoneOfInterest);

    // removing positions on ZOI boundaries
    if (intersectPositions.length > 1) {
        let posStrings = intersectPositions.map((position: Position) => JSON.stringify(position));
        if (isPointOnZOIBoundaries(outsidePosition, zoneOfInterest)) {
            const outPosStr = JSON.stringify(outsidePosition);
            const outPosIndex = posStrings.indexOf(outPosStr);
            if (outPosIndex !== -1)
                posStrings.splice(outPosIndex, 1);
        }
        if (isPointOnZOIBoundaries(insidePosition, zoneOfInterest)) {
            const inPosStr = JSON.stringify(insidePosition);
            const inPosIndex = posStrings.indexOf(inPosStr);
            if (inPosIndex !== -1)
                posStrings.splice(inPosIndex, 1);
        }

        intersectPositions = posStrings.map((point: string) => JSON.parse(point));
    }

    if (intersectPositions.length !== 1) {
        throw new RangeError('Segment between input positions must intersect zone of interest only once '
            + `(${intersectPositions.length} intersections found).`);
    }

    return intersectPositions[0];
}


/**
 * Computes intersections between a segment and a polygon's boundaries.
 *
 * @param firstPosition input position
 * @param secondPosition input position
 * @param polygon area to check against for collisions
 */
export function getPolygonIntersections (
    firstPosition: Position,
    secondPosition: Position,
    polygon: Feature<Polygon>
) : Position[] {

    // create a lineString between the two positions
    const entryLine: Feature<LineString> = lineString([firstPosition, secondPosition]);
    let intersectPositions: Position[] = [];

    // create a lineString for each polygon segment
    for (let i=0, len=polygon.geometry!.coordinates[0].length; i<len-1; i++) {
        const coord1: Position = polygon.geometry!.coordinates[0][i];
        const coord2: Position = polygon.geometry!.coordinates[0][i+1];
        const zoneSide: Feature<LineString> = lineString([coord1, coord2]);

        // for each line, check if they intersect
        const intersection: FeatureCollection<Point> = lineIntersect(entryLine, zoneSide);

        // if yes, save the intersection point
        if (intersection.features.length !== 0) {
            intersectPositions.push(
                intersection.features[0].geometry!.coordinates
            );
        }
    }

    // removing positions duplicates
    // (can be induced by an input location which is a polygon edge = part of several polygon segments)
    let posStrings: string[] = intersectPositions.map((position: Position) => JSON.stringify(position));
    posStrings = posStrings.filter((point: string, index: number) => index === posStrings.lastIndexOf(point));
    intersectPositions = posStrings.map((point: string) => JSON.parse(point));

    return intersectPositions;
}


/**
 * Splits a node into four equal nodes (area-wise).
 *
 * @param node node to split
 */
export function splitNode (node: ClusteringTreeNode): ClusteringTreeNode[] {
    const boundingBox = bboxPolygon(bbox(node.zoneOfInterest));
    const boxCenter = center(boundingBox);
    const subZones: Feature<Polygon>[] = [];

    for (let i=0; i<4; i++) {
        const boxEdge = boundingBox.geometry!.coordinates[0][i];
        const newNodeEdge1: number[] = [boxCenter.geometry!.coordinates[0], boxEdge[1]];
        const newNodeEdge2: number[] = [boxEdge[0], boxCenter.geometry!.coordinates[1]];

        subZones.push(
            polygon([[boxEdge, newNodeEdge1, boxCenter.geometry!.coordinates, newNodeEdge2, boxEdge]])
        );
    }

    return subZones.map((subZone => buildZOI(subZone, node.paths)));
}
