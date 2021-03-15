import {Feature, lineString, LineString, featureCollection, Point, point} from "@turf/helpers";
import {ClusteringTreeNode} from "../classes/ClusteringTreeNode";
import {booleanEqual, booleanPointOnLine, center} from "@turf/turf";
import {getZOIBoundaries, getZOIVertexes, isPointAZOIVertex} from "./zoiUtils";

/**
 * Returns average paths for a zone of interest.
 * Path are made of two locations, entrance average and exit average position.
 *
 * @param node
 */
export function extractAveragePaths (
    node: ClusteringTreeNode
) : Feature<LineString>[] {

    if (node.paths.length === 0) {
        throw new RangeError('Cannot extract average locations from a node having no paths.');
    }

    const ZOIEntrancesAndExits: ZOIFeaturesToLocations = extractEntrancesAndExits(node);
    const averagePaths: Feature<LineString>[] = [];
    const ZOIBoundaries = getZOIBoundaries(node.zoneOfInterest);
    const ZOIVertexes = getZOIVertexes(node.zoneOfInterest);

    for (const path of node.paths) {
        const firstLocation = path.geometry!.coordinates[0];
        const lastLocation = path.geometry!.coordinates[path.geometry!.coordinates.length-1];
        let startBoundaryId = 0;
        let exitBoundaryId = 0;


        // first, checking if path starts from or ends to a ZOI's vertex
        for (const vertex of ZOIVertexes) {
            if (booleanEqual(vertex, point(firstLocation)))
                startBoundaryId = getFeatureId(vertex);
            else if (booleanEqual(vertex, point(lastLocation)))
                exitBoundaryId = getFeatureId(vertex);
        }

        // if it's not the case, checking from which boundaries path starts/ends
        if (startBoundaryId === 0 || exitBoundaryId === 0) {
            for (const boundary of ZOIBoundaries) {
                if (startBoundaryId === 0 && booleanPointOnLine(firstLocation, boundary)) {
                    startBoundaryId = getFeatureId(boundary);
                } if (exitBoundaryId === 0 && booleanPointOnLine(lastLocation, boundary)) {
                    exitBoundaryId = getFeatureId(boundary);
                }
            }
        }

        // TODO if hasZOIexit is true, then exitBoundaryId shouldn't equal 0
        if (path.properties!.hasZOIentrance && path.properties!.hasZOIexit && exitBoundaryId !== 0) {
            // build average path
            const averagePath = lineString([
                ZOIEntrancesAndExits[startBoundaryId].entrance!.geometry!.coordinates,
                ZOIEntrancesAndExits[exitBoundaryId].exit!.geometry!.coordinates
            ], {weight: 1});

            // if it is already included, increase its weight by one
            let found = false;
            for (const path of averagePaths) {
                if (booleanEqual(path, averagePath)) {
                    path.properties!.weight += 1;
                    found = true;
                    break;
                }
            }

            // else add it
            if (!found)
                averagePaths.push( averagePath );
        }

        else if (path.properties!.hasZOIentrance && !path.properties!.hasZOIexit) {
            averagePaths.push (
                lineString([
                    ZOIEntrancesAndExits[startBoundaryId].entrance!.geometry!.coordinates,
                    lastLocation
                ], {weight: 1})
            );
        }

        else if (!path.properties!.hasZOIentrance && path.properties!.hasZOIexit) {
            averagePaths.push (
                lineString([
                    firstLocation,
                    ZOIEntrancesAndExits[exitBoundaryId].exit!.geometry!.coordinates
                ], {weight: 1})
            );
        }
    }

    return averagePaths;
}


/**
 * These type and interface allow to map each one of a zone of interest's boundaries
 * to associated entrance and exit locations.
 * Boundary identifier is obtained via a call to getFeatureId method.
 */
export type ZOIFeaturesToLocations = {[boundaryId: string]: extractionZOIFeature};
interface extractionZOIFeature {
    entrance: Feature<Point> | null;
    exit: Feature<Point> | null;
}


/**
 * Returns a unique identifier for a given GeoJSON feature.
 * This identifier can be used to index content in a BoundariesToLocations map, for instance.
 *
 * @param boundary feature to identify
 */
function getFeatureId (boundary: Feature<any>): number {
    return hashCode(JSON.stringify(boundary));
}

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
function hashCode(str: string): number {
    let hash = 0, i, chr;
    for (i = 0; i < str.length; i++) {
        chr   = str.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}


/**
 * Returns a map linking a zone of interest's features (boundaries and vertexes) to
 * associated entrance and exit locations.
 *
 * @param node
 */
export function extractEntrancesAndExits (
    node: ClusteringTreeNode
): ZOIFeaturesToLocations {

    const ZOIEntrancesAndExits: ZOIFeaturesToLocations = {};
    const ZOIBoundaries = getZOIBoundaries(node.zoneOfInterest);
    const ZOIVertexes = getZOIVertexes(node.zoneOfInterest);

    for (const vertex of ZOIVertexes) {
        let isEntrance: boolean = false;
        let isExit: boolean = false;

        for (const path of node.paths) {
            const firstLocation = point(path.geometry!.coordinates[0]);
            const lastLocation = point(path.geometry!.coordinates[path.geometry!.coordinates.length-1]);

            if (path.properties!.hasZOIentrance && booleanEqual(firstLocation, vertex))
                isEntrance = true;
            if (path.properties!.hasZOIexit && booleanEqual(lastLocation, vertex))
                isExit = true;
        }

        if (isExit || isEntrance) {
            ZOIEntrancesAndExits[getFeatureId(vertex)] = {
                entrance: isEntrance ? vertex : null,
                exit: isExit ? vertex : null
            };
        }
    }

    for (const boundary of ZOIBoundaries) {
        const entranceCoordinates: Feature<Point>[] = [];
        const exitCoordinates: Feature<Point>[] = [];

        for (const path of node.paths) {
            const firstLocation = point(path.geometry!.coordinates[0]);
            const lastLocation = point(path.geometry!.coordinates[path.geometry!.coordinates.length-1]);

            if (path.properties!.hasZOIentrance && booleanPointOnLine(firstLocation, boundary) && !isPointAZOIVertex(firstLocation, node.zoneOfInterest))
                entranceCoordinates.push( firstLocation );
            if (path.properties!.hasZOIexit && booleanPointOnLine(lastLocation, boundary) && !isPointAZOIVertex(lastLocation, node.zoneOfInterest))
                exitCoordinates.push( lastLocation );
        }

        if (entranceCoordinates.length > 0 || exitCoordinates.length > 0) {
            ZOIEntrancesAndExits[getFeatureId(boundary)] = {
                entrance: entranceCoordinates.length !== 0
                    ? center(featureCollection(entranceCoordinates))
                    : null,
                exit: exitCoordinates.length !== 0
                    ? center(featureCollection(exitCoordinates))
                    : null
            };
        }
    }

    return ZOIEntrancesAndExits;
}
