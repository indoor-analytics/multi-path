import {expect} from 'chai';
import {Position} from '@turf/helpers';
import {
    addWaysToPath,
    buildZOI, getPolygonIntersections,
    getZOIIntersectionPosition,
    isPositionInsideZOI,
    splitNode
} from "../../src/compute/zonesBuilding";
import {
    citadel,
    citadelSubZone,
    rectangularZoneOfInterest,
    trainStationZoneOfInterest,
    zoneOfInterest
} from "../features/testZones";
import {
    aroundCitadelPath1, aroundCitadelPath2,
    citadelBoundariesPath,
    citadelBoundaryToInsidePath,
    citadelBoundaryToOutsidePath, citadelInsideToBoundaryPath,
    citadelOutsideToBoundaryPath,
    citadelOutsideToOutsidePath,
    citadelPath,
    complexCitadelPath,
    innerCitadelLine,
    innerCitadelPaths,
    multiEntrancesCitadelPath,
    outerCitadelPath1,
    outerCitadelPaths
} from "../features/testPaths";
import {area} from "@turf/turf";
import {ClusteringTreeNode} from "../../src/classes/ClusteringTreeNode";
import assert = require("assert");


describe ('ZOI building', () => {
    describe ('isPositionInsideZOI', () => {
        // https://gist.github.com/Alystrasz/4b53698cc3043ca9ba9254089a5b2ba2
        it ('should approve position inside ZOI', () => {
            const position = [
                2.3941612243652344,
                51.05164645510135
            ];
            const result = isPositionInsideZOI(position, zoneOfInterest);
            expect(result).to.equal(true);
        });

        // https://gist.github.com/Alystrasz/41e49b37618a497918006153fb19786e
        it ('should reject position outside ZOI', () => {
            const position = [
                2.396242618560791,
                51.053683206065706
            ];
            const result = isPositionInsideZOI(position, zoneOfInterest);
            expect(result).to.equal(false);
        });

        // https://gist.github.com/Alystrasz/b87d2aaaef7147634a42ae9bb4286584
        it ('should approve position on ZOI segment', () => {
            const position = [
                2.3894834518432617,
                51.05106018750338
            ];
            const result = isPositionInsideZOI(position, zoneOfInterest);
            expect(result).to.equal(true);
        });

        // https://gist.github.com/Alystrasz/439fbae66b398921650122f4affdc6ca
        it ('should approve position on ZOI edge node', () => {
            const position = [
                2.398538589477539,
                51.05304926006922
            ];
            const result = isPositionInsideZOI(position, zoneOfInterest);
            expect(result).to.equal(true);
        });
    });


    describe ('getPolygonIntersections', () => {
        // https://gist.github.com/Alystrasz/39dc8d719c56edb04e4329b79700334a
        it ('should get intersection with rectangular ZOI border', () => {
            const innerPosition: Position = [ 2.05, 51.05 ];
            const outerPosition: Position = [ 1.9, 51.05 ];
            const expectedPosition: Position = [ 2, 51.05 ];

            const result = getPolygonIntersections(innerPosition, outerPosition, rectangularZoneOfInterest);
            expect(result.length).to.equal(1);
            expect(result[0]).to.deep.equal(expectedPosition);
        });

        // https://gist.github.com/Alystrasz/a49e70fd2664febbbc6843e2cbe665ab
        it ('should get intersection with rectangular ZOI border 2', () => {
            const innerPosition: Position = [ 2.05, 51.05 ];
            const outerPosition: Position = [ 2.15, 51.1 ];
            const expectedPosition: Position = [ 2.1, 51.075 ];

            const result = getPolygonIntersections(innerPosition, outerPosition, rectangularZoneOfInterest);
            expect(result.length).to.equal(1);
            expect(result[0]).to.deep.equal(expectedPosition);
        });

        // https://gist.github.com/Alystrasz/dd94560adaf4f310985b09a91d9987eb
        it ('should get intersection with complex ZOI', () => {
            const innerPosition: Position = [ 3.073, 50.6356 ];
            const outerPosition: Position = [ 3.073, 50.6346 ];
            const expectedPosition: Position = [ 3.073, 50.635333 ];

            let result = getPolygonIntersections(innerPosition, outerPosition, trainStationZoneOfInterest);
            expect(result.length).to.equal(1);
            const intersection: number[] = result[0];
            expect([+intersection[0].toFixed(6), +intersection[1].toFixed(6)])
                .to.deep.equal(expectedPosition);
        });

        // https://gist.github.com/Alystrasz/c3ee2d8c8d773b2e15aaaf53310a8788
        it ('should get intersection while point is one of ZOI\'s nodes', () => {
            const innerPosition: Position = [ 3.0714213475584984, 50.63705826480064 ];
            const outerPosition: Position = [ 3.0709898471832275, 50.637693635919895 ];
            const expectedPosition: Position = [ 3.0714213475584984, 50.63705826480064 ];
            expect(expectedPosition).to.deep.equal(innerPosition);

            const result = getPolygonIntersections(innerPosition, outerPosition, trainStationZoneOfInterest);
            expect(result.length).to.equal(1);
            expect(result[0]).to.deep.equal(expectedPosition);
        });

        // https://gist.github.com/Alystrasz/3ff4993441e0cb5c675d8a3ca6d47f80
        it ('should find 0 intersections', () => {
            const innerPosition: Position = [ 3.0711722373962402, 50.63514529507524 ];
            const outerPosition: Position = [ 3.0733823776245117, 50.63477783266147 ];
            const result = getPolygonIntersections(innerPosition, outerPosition, trainStationZoneOfInterest);
            expect(result.length).to.equal(0);
        });

        // https://gist.github.com/Alystrasz/edecfdd01081a31d18c10c3fdaf44cc6
        it ('should find 0 intersections when both points are inside ZOI', () => {
            const innerPosition: Position = [ 3.072239756584167, 50.63596867264639 ];
            const outerPosition: Position = [ 3.0738168954849243, 50.636234055732096 ];
            const result = getPolygonIntersections(innerPosition, outerPosition, trainStationZoneOfInterest);
            expect(result.length).to.equal(0);
        });

        // https://gist.github.com/Alystrasz/20646fc643765817ec21a4082fb8a353
        it ('should find 3 intersections', () => {
            const innerPosition: Position = [ 3.0719393491744995, 50.63562758513386 ];
            const outerPosition: Position = [ 3.0715222656726837, 50.635495742664 ];
            const result = getPolygonIntersections(innerPosition, outerPosition, trainStationZoneOfInterest);
            expect(result.length).to.equal(3);
        });

        // https://gist.github.com/Alystrasz/c82f4df4becb462ab0e2ffc5be79be25
        it ('should find 5 intersections', () => {
            const innerPosition: Position = [ 3.074846863746643, 50.63493094234966 ];
            const outerPosition: Position = [ 3.0700859427452087, 50.635871705375926 ];
            const result = getPolygonIntersections(innerPosition, outerPosition, trainStationZoneOfInterest);
            expect(result.length).to.equal(5);
        });
    });


    describe ('getZOIIntersectionPosition', () => {
        // https://gist.github.com/Alystrasz/39dc8d719c56edb04e4329b79700334a
        it ('should get intersection with rectangular ZOI border', () => {
            const innerPosition: Position = [ 2.05, 51.05 ];
            const outerPosition: Position = [ 1.9, 51.05 ];
            const expectedPosition: Position = [ 2, 51.05 ];

            const result = getZOIIntersectionPosition(rectangularZoneOfInterest, innerPosition, outerPosition);
            expect(result).to.deep.equal(expectedPosition);
        });

        // https://gist.github.com/Alystrasz/a49e70fd2664febbbc6843e2cbe665ab
        it ('should get intersection with rectangular ZOI border 2', () => {
            const innerPosition: Position = [ 2.05, 51.05 ];
            const outerPosition: Position = [ 2.15, 51.1 ];
            const expectedPosition: Position = [ 2.1, 51.075 ];

            const result = getZOIIntersectionPosition(rectangularZoneOfInterest, innerPosition, outerPosition);
            expect(result).to.deep.equal(expectedPosition);
        });

        // https://gist.github.com/Alystrasz/dd94560adaf4f310985b09a91d9987eb
        it ('should get intersection with complex ZOI', () => {
            const innerPosition: Position = [ 3.073, 50.6356 ];
            const outerPosition: Position = [ 3.073, 50.6346 ];
            const expectedPosition: Position = [ 3.073, 50.635333 ];

            let result = getZOIIntersectionPosition(trainStationZoneOfInterest, innerPosition, outerPosition);
            result = [+result[0].toFixed(6), +result[1].toFixed(6)];
            expect(result).to.deep.equal(expectedPosition);
        });

        // https://gist.github.com/Alystrasz/c3ee2d8c8d773b2e15aaaf53310a8788
        it ('should get intersection while point is one of ZOI\'s nodes', () => {
            const innerPosition: Position = [ 3.0714213475584984, 50.63705826480064 ];
            const outerPosition: Position = [ 3.0709898471832275, 50.637693635919895 ];
            const expectedPosition: Position = [ 3.0714213475584984, 50.63705826480064 ];
            expect(expectedPosition).to.deep.equal(innerPosition);

            const result = getZOIIntersectionPosition(trainStationZoneOfInterest, innerPosition, outerPosition);
            expect(result).to.deep.equal(expectedPosition);
        });

        // https://gist.github.com/Alystrasz/3ff4993441e0cb5c675d8a3ca6d47f80
        it ('should throw an error when both points are outside ZOI', () => {
            const innerPosition: Position = [ 3.0711722373962402, 50.63514529507524 ];
            const outerPosition: Position = [ 3.0733823776245117, 50.63477783266147 ];
            expect(() =>
                getZOIIntersectionPosition(trainStationZoneOfInterest, innerPosition, outerPosition))
                .to.throw(
                    RangeError,
                    'Both positions must not be located outside the zone of interest.'
                );
        });

        // https://gist.github.com/Alystrasz/edecfdd01081a31d18c10c3fdaf44cc6
        it ('should throw an error when both points are inside ZOI', () => {
            const innerPosition: Position = [ 3.072239756584167, 50.63596867264639 ];
            const outerPosition: Position = [ 3.0738168954849243, 50.636234055732096 ];
            expect(() =>
                getZOIIntersectionPosition(trainStationZoneOfInterest, innerPosition, outerPosition))
                .to.throw(
                    RangeError,
                    'Both positions must not be located inside the zone of interest.'
                );
        });

        // https://gist.github.com/Alystrasz/20646fc643765817ec21a4082fb8a353
        it ('should throw an error when there are several intersections', () => {
            const innerPosition: Position = [ 3.0719393491744995, 50.63562758513386 ];
            const outerPosition: Position = [ 3.0715222656726837, 50.635495742664 ];
            expect(() =>
                getZOIIntersectionPosition(trainStationZoneOfInterest, innerPosition, outerPosition))
                .to.throw(
                    RangeError,
                    'Segment between input positions must intersect zone of interest only once (3 intersections found).'
                );
        });

        // https://gist.github.com/Alystrasz/c82f4df4becb462ab0e2ffc5be79be25
        it ('should throw an error with exactly 5 intersections', () => {
            const innerPosition: Position = [ 3.074846863746643, 50.63493094234966 ];
            const outerPosition: Position = [ 3.0700859427452087, 50.635871705375926 ];
            expect(() =>
                getZOIIntersectionPosition(trainStationZoneOfInterest, innerPosition, outerPosition))
                .to.throw(
                    RangeError,
                    'Segment between input positions must intersect zone of interest only once (5 intersections found).'
                );
        });
    });


    describe ('splitNode', () => {
        it ('should split node in four sub-nodes', () => {
            const node = buildZOI(citadel, [innerCitadelLine]);
            const subNodes = splitNode(node);
            expect(subNodes.length).to.equal(4);

            const citadelArea = area(node.zoneOfInterest);
            let totalArea = 0;
            subNodes.map((node: ClusteringTreeNode) => {
                totalArea += area(node.zoneOfInterest);
            });
            expect(+''+totalArea.toFixed(6)).to.equal(+''+citadelArea.toFixed(6));
        });
    });


    describe( 'addWaysToPath', () => {
        // https://gist.github.com/Alystrasz/dd158e1428bbc33709a27cb23f7b5286
        it ('should mark entrance and exit on a path which begins and ends on ZOI boundaries', () => {
            const path = addWaysToPath(citadelBoundariesPath, citadel);
            expect(path.properties!.hasZOIentrance).to.equal(true);
            expect(path.properties!.hasZOIexit).to.equal(true);
        });

        // https://gist.github.com/Alystrasz/9d3f6fc466fec4d58449ec08daed39ac
        it ('should mark no entrance nor exit on a path strictly included into ZOI', () => {
            const line = addWaysToPath(innerCitadelLine, citadel);
            expect(line.properties!.hasZOIentrance).to.equal(false);
            expect(line.properties!.hasZOIexit).to.equal(false);
        });

        it ('should throw if path is exclusively outside ZOI', () => {
            expect(() => {
                addWaysToPath(outerCitadelPath1, citadel);
            }).to.throw(
                RangeError,
                'All path locations must be strictly included in the zone of interest.'
            );
        });

        // https://gist.github.com/Alystrasz/a4521dbda92381953efa189ea0ca4be6
        it ('should throw if path has locations outside ZOI', () => {
            expect(() => {
                addWaysToPath(multiEntrancesCitadelPath, citadel);
            }).to.throw(
                RangeError,
                'All path locations must be strictly included in the zone of interest.'
            );
        });

        // https://gist.github.com/Alystrasz/f09719e4d95d8c7bd83d3c2c92be4dc1
        it ('should mark entrance on a path', () => {
            const line = addWaysToPath(citadelBoundaryToInsidePath, citadel);
            expect(line.properties!.hasZOIentrance).to.equal(true);
            expect(line.properties!.hasZOIexit).to.equal(false);
        });

        // https://gist.github.com/Alystrasz/97c9eb452af58db04b85adb2d773a7ee
        it ('should mark exit on a path', () => {
            const line = addWaysToPath(citadelInsideToBoundaryPath, citadel);
            expect(line.properties!.hasZOIentrance).to.equal(false);
            expect(line.properties!.hasZOIexit).to.equal(true);
        });
    });


    describe ('buildZOI', () => {
        // https://gist.github.com/Alystrasz/9d3f6fc466fec4d58449ec08daed39ac
        it ('should return input path as it is strictly included in ZOI', () => {
            const node = buildZOI(citadel, [innerCitadelLine]);
            expect(node.paths.length).to.equal(1);
            expect(node.paths[0].geometry!.coordinates).to.deep.equal(innerCitadelLine.geometry!.coordinates);
            expect(node.paths[0].properties!.hasZOIentrance).to.equal(false);
            expect(node.paths[0].properties!.hasZOIexit).to.equal(false);
        });

        // https://gist.github.com/Alystrasz/f84276506f301ea0097e69a54232e507
        it ('should return several paths strictly included in ZOI', () => {
            const node = buildZOI(citadel, innerCitadelPaths);
            expect(node.paths.length).to.equal(innerCitadelPaths.length);

            for (let i=0; i<innerCitadelPaths.length; i++) {
                const path = node.paths[i];
                const originalPath = innerCitadelPaths[i];

                expect(path.geometry!.coordinates).to.deep.equal(originalPath.geometry!.coordinates);
                expect(path.properties!.hasZOIentrance).to.equal(false);
                expect(path.properties!.hasZOIexit).to.equal(false);
            }
        });

        // https://gist.github.com/Alystrasz/138d5c3322ee2ec54ffe9c20cd5227cf
        it ('should cut a path which has outside positions', () => {
            const locationsCount = citadelPath.geometry!.coordinates.length;
            const node = buildZOI(citadel, [citadelPath]);
            expect(node.paths.length).to.equal(1);

            // checking locations count
            const truncatedPath = node.paths[0];
            expect(truncatedPath.geometry!.coordinates.length)
                .to.equal(
                    locationsCount
                    - 4     // outside positions
                    + 2     // ZOI intersections
                );

            // checking if locations inside ZOI have been preserved
            expect(truncatedPath.geometry!.coordinates)
                .to.include.members(citadelPath.geometry!.coordinates.slice(2, 6));

            expect(truncatedPath.properties!.hasZOIentrance).to.equal(true);
            expect(truncatedPath.properties!.hasZOIexit).to.equal(true);
        });

        // https://gist.github.com/Alystrasz/dd158e1428bbc33709a27cb23f7b5286
        it ('should not cut a path which edges are on ZOI boundaries', () => {
            const node = buildZOI(citadel, [citadelBoundariesPath]);
            expect(node.paths.length).to.equal(1);

            const truncatedPath = node.paths[0];
            expect(truncatedPath.geometry!.coordinates).to.deep.equal(citadelBoundariesPath.geometry!.coordinates);

            expect(truncatedPath.properties!.hasZOIentrance).to.equal(true);
            expect(truncatedPath.properties!.hasZOIexit).to.equal(true);
        });

        // https://gist.github.com/Alystrasz/7e6071f94c3347894a87feab48dedf5b
        it ('should cut a path which starts on ZOI boundary and ends outside it', () => {
            const node = buildZOI(citadel, [citadelBoundaryToOutsidePath]);
            expect(node.paths.length).to.equal(1);

            const truncatedPathPositions = node.paths[0].geometry!.coordinates;
            expect(truncatedPathPositions.length).to.equal(2);

            const firstPos = truncatedPathPositions[0];
            expect(firstPos[0]).to.be.approximately(citadelBoundaryToOutsidePath.geometry!.coordinates[0][0], 0.000000000000001);
            expect(firstPos[1]).to.be.approximately(citadelBoundaryToOutsidePath.geometry!.coordinates[0][1], 0.000000000000001);

            expect(node.paths[0].properties!.hasZOIentrance).to.equal(true);
            expect(node.paths[0].properties!.hasZOIexit).to.equal(true);
        });

        // https://gist.github.com/Alystrasz/64f3cb8a686eed865646400a87346e7d
        it ('should cut a path which starts outside ZOI and ends on its boundaries', () => {
            const node = buildZOI(citadel, [citadelOutsideToBoundaryPath]);
            expect(node.paths.length).to.equal(1);

            const truncatedPathPositions = node.paths[0].geometry!.coordinates;
            expect(truncatedPathPositions.length).to.equal(2);
            expect(truncatedPathPositions[1]).to.deep.equal(citadelOutsideToBoundaryPath.geometry!.coordinates[1]);

            expect(node.paths[0].properties!.hasZOIentrance).to.equal(true);
            expect(node.paths[0].properties!.hasZOIexit).to.equal(true);
        });

        // https://gist.github.com/Alystrasz/7444cf5508d3096588e3a967bd0bcaca
        it ('should cut a path which starts and ends outside ZOI', () => {
            const node = buildZOI(citadel, [citadelOutsideToOutsidePath]);
            expect(node.paths.length).to.equal(1);

            expect(node.paths[0].properties!.hasZOIentrance).to.equal(true);
            expect(node.paths[0].properties!.hasZOIexit).to.equal(true);
        });

        // https://gist.github.com/Alystrasz/86d1477b5caa047bea29569ade278c39
        it ('should return an empty ZOI with outside paths', () => {
            const node = buildZOI(citadel, outerCitadelPaths);
            expect(node.paths.length).to.equal(0);
        });

        // https://gist.github.com/Alystrasz/a4521dbda92381953efa189ea0ca4be6
        it ('should split a path that enters the ZOI several times in several paths', () => {
            const node = buildZOI(citadel, [multiEntrancesCitadelPath]);
            expect(node.paths.length).to.equal(2);

            // first segment
            const truncatedPath1 = node.paths[0];
            expect(truncatedPath1.geometry!.coordinates.length).to.equal(5);
            expect(truncatedPath1.geometry!.coordinates)
                .to.include.members(multiEntrancesCitadelPath.geometry!.coordinates.slice(3, 6));
            expect(truncatedPath1.properties!.hasZOIentrance).to.equal(true);
            expect(truncatedPath1.properties!.hasZOIexit).to.equal(true);

            // second segment
            const truncatedPath2 = node.paths[1];
            expect(truncatedPath2.geometry!.coordinates.length).to.equal(6);
            expect(truncatedPath2.geometry!.coordinates)
                .to.include.members(multiEntrancesCitadelPath.geometry!.coordinates.slice(8, 12));
            expect(truncatedPath2.properties!.hasZOIentrance).to.equal(true);
            expect(truncatedPath2.properties!.hasZOIexit).to.equal(true);
        });

        // https://gist.github.com/Alystrasz/6ded42e3fc6baabe99dd56d5964bdac9
        it ('should correctly split complex path', () => {
            const node = buildZOI(citadel, [complexCitadelPath]);
            const originalPositions = complexCitadelPath.geometry!.coordinates;
            expect(node.paths.length).to.equal(5);

            const segment1Positions = node.paths[0].geometry!.coordinates;
            expect(segment1Positions.length).to.equal(2);
            expect(segment1Positions).to.deep.include(getZOIIntersectionPosition(citadel, originalPositions[0], originalPositions[1]));
            expect(segment1Positions).to.include(originalPositions[0]);
            expect(node.paths[0].properties!.hasZOIentrance).to.equal(false);
            expect(node.paths[0].properties!.hasZOIexit).to.equal(true);

            const segment2Positions = node.paths[1].geometry!.coordinates;
            expect(segment2Positions.length).to.equal(3);
            expect(segment2Positions).to.deep.include(getZOIIntersectionPosition(citadel, originalPositions[1], originalPositions[2]));
            expect(segment2Positions).to.include(complexCitadelPath.geometry!.coordinates[2]);
            expect(segment2Positions).to.deep.include(getZOIIntersectionPosition(citadel, originalPositions[2], originalPositions[3]));
            expect(node.paths[1].properties!.hasZOIentrance).to.equal(true);
            expect(node.paths[1].properties!.hasZOIexit).to.equal(true);

            const segment3Positions = node.paths[2].geometry!.coordinates;
            expect(segment3Positions.length).to.equal(8);
            expect(segment3Positions).to.deep.include(getZOIIntersectionPosition(citadel, originalPositions[4], originalPositions[5]));
            expect(segment3Positions).to.include.members(complexCitadelPath.geometry!.coordinates.slice(5, 11));
            expect(segment3Positions).to.deep.include(getZOIIntersectionPosition(citadel, originalPositions[10], originalPositions[11]));
            expect(node.paths[2].properties!.hasZOIentrance).to.equal(true);
            expect(node.paths[2].properties!.hasZOIexit).to.equal(true);

            const segment4Positions = node.paths[3].geometry!.coordinates;
            expect(segment4Positions.length).to.equal(5);
            expect(segment4Positions).to.deep.include(getZOIIntersectionPosition(citadel, originalPositions[13], originalPositions[14]));
            expect(segment4Positions).to.include.members(complexCitadelPath.geometry!.coordinates.slice(14, 17));
            expect(segment4Positions).to.deep.include(getZOIIntersectionPosition(citadel, originalPositions[16], originalPositions[17]));
            expect(node.paths[3].properties!.hasZOIentrance).to.equal(true);
            expect(node.paths[3].properties!.hasZOIexit).to.equal(true);

            const segment5Position = node.paths[4].geometry!.coordinates;
            expect(segment5Position.length).to.equal(2);
            expect(segment5Position).to.deep.include(getZOIIntersectionPosition(citadel, originalPositions[18], originalPositions[19]));
            expect(segment5Position).to.include(complexCitadelPath.geometry!.coordinates.pop());
            expect(node.paths[4].properties!.hasZOIentrance).to.equal(true);
            expect(node.paths[4].properties!.hasZOIexit).to.equal(false);
        });

        // https://gist.github.com/Alystrasz/4101041fe24c024bded9383d5bf803d8
        it ('should not change paths direction while truncating them', () => {
            const node = buildZOI(citadelSubZone, [aroundCitadelPath1, aroundCitadelPath2]);
            expect(node.paths.length).to.equal(2);

            for (const path of node.paths) {
                const coordinates = path.geometry!.coordinates;

                switch (path.geometry!.coordinates.length) {
                    case 2:
                        expect(coordinates[0]).to.deep.equal([
                            3.0470577733348096,
                            50.64329664322063
                        ]);
                        expect(coordinates[1]).to.deep.equal([
                            3.0479979515075684,
                            50.642971435082856
                        ]);
                        break;
                    case 3:
                        expect(coordinates[0]).to.deep.equal([
                            3.0479979515075684,
                            50.64271789418128
                        ]);
                        expect(coordinates[2]).to.deep.equal([
                            3.0479979515075684,
                            50.6416667952829
                        ]);
                        break;
                    default:
                        assert.fail('This zone should only contain two paths, one with 2 locations,' +
                            'the other with 3 locations.');
                }
            }
        });
    });
});
