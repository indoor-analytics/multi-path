import {citadel, citadelSubZone, citeScientifiqueCampus, inriaZOI, stationFragment} from "../features/testZones";
import {
    aroundCitadelPath1, aroundCitadelPath2,
    campusEntranceOnVertexPath1,
    campusEntranceOnVertexPath2,
    campusExitOnEdgePath1,
    campusExitOnEdgePath2,
    campusFromBottomToTop1,
    campusFromBottomToTop2,
    campusFromTopToBottom1,
    campusFromTopToBottom2,
    campusNoEntrancePath,
    campusNoExitPath,
    campusPath1,
    campusPath2,
    campusPath3,
    campusVertexToBottomPath,
    campusVertexToVertexPath, citadelFromToBoundaryPath,
    innerCitadelLine,
    innerCitadelPaths,
    inriaBoundariesPath,
    inriaBoundariesPath2, stationFragmentPath, stationFragmentPath2
} from "../features/testPaths";
import {extractAveragePaths, extractEntrancesAndExits} from "../../src/compute/graphExtraction";
import {expect} from 'chai';
import {booleanEqual, midpoint} from "@turf/turf";
import {buildZOI} from "../../src/compute/zonesBuilding";
import {point} from "@turf/helpers";


describe ('Graph extraction', () => {
    describe ('extractEntrancesAndExits', () => {
        // https://gist.github.com/Alystrasz/335b43cf0b497961ff4648c4033e57e3
        it ('should return one entrance location + one exit location (with same coordinates as input path)', () => {
            const node = buildZOI(inriaZOI, [inriaBoundariesPath]);
            const locations = extractEntrancesAndExits(node);

            let entrancesCount = 0,
                exitsCount = 0;

            for (const boundaryKey of Object.keys(locations)) {
                const boundaryData = locations[boundaryKey];
                if (boundaryData.entrance !== null) {
                    entrancesCount += 1;
                    expect(boundaryData.entrance.geometry!.coordinates).to.deep.equal(inriaBoundariesPath.geometry!.coordinates[0]);
                }
                if (boundaryData.exit !== null) {
                    exitsCount += 1;
                    expect(boundaryData.exit.geometry!.coordinates).to.deep.equal(inriaBoundariesPath.geometry!.coordinates[1]);
                }
            }

            expect(entrancesCount).to.equal(1);
            expect(exitsCount).to.equal(1);
        });

        // https://gist.github.com/Alystrasz/4c4e538ede57d7d6c2c5ebc30483d10e
        it ('should return one boundary with average entrance + one with average exit', () => {
            const node = buildZOI(inriaZOI, [inriaBoundariesPath, inriaBoundariesPath2]);
            const locations = extractEntrancesAndExits(node);

            let entrancesCount = 0,
                exitsCount = 0;

            for (const boundaryKey of Object.keys(locations)) {
                const boundaryData = locations[boundaryKey];
                if (boundaryData.entrance !== null) {
                    expect(boundaryData.exit).to.equal(null);
                    entrancesCount += 1;
                } else if (boundaryData.exit !== null) {
                    expect (boundaryData.entrance).to.equal(null);
                    exitsCount += 1;
                }
            }

            expect(entrancesCount).to.equal(1);
            expect(exitsCount).to.equal(1);
        });

        // https://gist.github.com/Alystrasz/e1108e0ce9c4efc3d004caac418dbcd5
        it ('should return entrances and exits situated on same boundaries', () => {
            const node = buildZOI(
                citeScientifiqueCampus,
                [campusFromTopToBottom1, campusFromTopToBottom2, campusFromBottomToTop1, campusFromBottomToTop2]
            );
            const locations = extractEntrancesAndExits(node);

            let entrancesCount = 0,
                exitsCount = 0;

            for (const boundaryKey of Object.keys(locations)) {
                const boundaryData = locations[boundaryKey];
                if (boundaryData.entrance !== null) {
                    expect(boundaryData.exit).to.not.equal(null);
                    entrancesCount += 1;
                }
                if (boundaryData.exit !== null) {
                    expect (boundaryData.entrance).to.not.equal(null);
                    exitsCount += 1;
                }
            }

            expect(entrancesCount).to.equal(2);
            expect(exitsCount).to.equal(2);
        });

        // https://gist.github.com/Alystrasz/48eb79e6971fb73adb4ca8e664c5a689
        it ('should return one entrance + one exit location with one path having no exit', () => {
            const node = buildZOI(citeScientifiqueCampus, [campusPath1, campusNoExitPath]);
            const locations = extractEntrancesAndExits(node);

            let entrancesCount = 0,
                exitsCount = 0;

            for (const boundaryKey of Object.keys(locations)) {
                const boundaryData = locations[boundaryKey];
                if (boundaryData.entrance !== null) {
                    expect(boundaryData.exit).to.equal(null);
                    entrancesCount += 1;
                }
                if (boundaryData.exit !== null) {
                    expect (boundaryData.entrance).to.equal(null);
                    exitsCount += 1;
                }
            }

            expect(entrancesCount).to.equal(1);
            expect(exitsCount).to.equal(1);
        });

        // https://gist.github.com/Alystrasz/b7cbdb1dfec9fe5bb2ee99e2463481e4
        it ("should return one exit with input paths ending on ZOI's edge", () => {
            const node = buildZOI(citeScientifiqueCampus, [campusExitOnEdgePath1, campusExitOnEdgePath2]);
            const locations = extractEntrancesAndExits(node);

            let entranceCount = 0,
                exitsCount = 0;

            for (const boundaryKey of Object.keys(locations)) {
                const boundaryData = locations[boundaryKey];
                if (boundaryData.entrance !== null) {
                    entranceCount += 1;
                }
                if (boundaryData.exit !== null) {
                    expect(booleanEqual(boundaryData.exit!, point(campusExitOnEdgePath1.geometry!.coordinates[1])))
                        .to.equal(true);
                    expect(booleanEqual(boundaryData.exit!, point(campusExitOnEdgePath2.geometry!.coordinates[1])))
                        .to.equal(true);
                    exitsCount += 1;
                }
            }

            expect(exitsCount).to.equal(1);
            expect(entranceCount).to.equal(1);
        });

        // https://gist.github.com/Alystrasz/68feb6dfec27ae0774dc55227827fae4
        it ("should return one entrance with input paths starting on ZOI's vertex", () => {
            const node = buildZOI(citeScientifiqueCampus, [campusEntranceOnVertexPath1, campusEntranceOnVertexPath2]);
            const locations = extractEntrancesAndExits(node);
            let entranceCount = 0;

            for (const boundaryKey of Object.keys(locations)) {
                const boundaryData = locations[boundaryKey];
                if (boundaryData.entrance !== null) {
                    expect(booleanEqual(boundaryData.entrance!, point(campusEntranceOnVertexPath1.geometry!.coordinates[0])))
                        .to.equal(true);
                    expect(booleanEqual(boundaryData.entrance!, point(campusEntranceOnVertexPath2.geometry!.coordinates[0])))
                        .to.equal(true);
                    entranceCount += 1;
                }
            }

            expect(entranceCount).to.equal(1);
        });

        // https://gist.github.com/Alystrasz/697004ed8f3795f9d6c4031f7533cf81
        it ('should return entrance + exit on path linking two ZOI vertexes', () => {
            const node = buildZOI(citeScientifiqueCampus, [campusVertexToVertexPath]);
            const locations = extractEntrancesAndExits(node);
            const locationsKeys = Object.keys(locations);
            expect(locationsKeys.length).to.equal(2);

            for (const key of locationsKeys) {
                const entry = locations[key];
                if (entry.entrance !== null)
                    expect(booleanEqual(entry.entrance!, point(campusVertexToVertexPath.geometry!.coordinates[0])))
                        .to.equal(true);
                if (entry.exit !== null)
                    expect(booleanEqual(entry.exit!, point(campusVertexToVertexPath.geometry!.coordinates[1])))
                        .to.equal(true);
            }
        });

        // https://gist.github.com/Alystrasz/f84276506f301ea0097e69a54232e507
        it ('should not return anything with paths strictly included in ZOI', () => {
            const node = buildZOI(citadel, innerCitadelPaths);
            const locations = extractEntrancesAndExits(node);
            expect(Object.keys(locations).length).to.equal(0);
        });

        // https://gist.github.com/Alystrasz/eb4296510422bcde032fee4e5390f4a6
        it ('should return one entrance + one exit on path starting and ending on same boundary', () => {
            const node = buildZOI(citadel, [citadelFromToBoundaryPath]);
            const boundaries = extractEntrancesAndExits(node);

            const boundaryKeys = Object.keys(boundaries);
            expect(boundaryKeys.length).to.equal(1);

            const boundary = boundaries[boundaryKeys[0]];
            expect(boundary.entrance).not.to.be.null;
            expect(boundary.exit).not.to.be.null;
        });

        // https://gist.github.com/Alystrasz/f2a0ecb91362dd30f45f32b8ae85746a
        it ('should return 3 entrances + 3 exits with paths on boundaries and others on vertexes', () => {
            const node = buildZOI(
                citeScientifiqueCampus,
                [
                    campusVertexToVertexPath,
                    campusFromTopToBottom1, campusFromTopToBottom2,
                    campusFromBottomToTop1, campusFromBottomToTop2
                ]
            );
            const features = extractEntrancesAndExits(node);
            const featuresKeys = Object.keys(features);
            // 2 boundaries having entrance/exit each + 2 vertexes (1 entrance + 1 exit)
            expect(featuresKeys.length).to.equal(2 + 2);

            let entrancesCount = 0,
                exitsCount = 0;
            for (const key of featuresKeys) {
                const value = features[key];
                if (value.exit !== null) exitsCount += 1;
                if (value.entrance !== null) entrancesCount += 1;
            }

            expect(entrancesCount).to.equal(3);
            expect(exitsCount).to.equal(3);
        });

        // https://gist.github.com/Alystrasz/13b4cbecfd3ecf2085ffa0facc841112
        it ('should extract 1 entrance + 2 exits', () => {
            const node = buildZOI(stationFragment, [stationFragmentPath, stationFragmentPath2]);
            const features = extractEntrancesAndExits(node);
            const featuresKeys = Object.keys(features);
            expect(featuresKeys.length).to.equal(3);

            let entrancesCount = 0,
                exitsCount = 0;
            for (const key of featuresKeys) {
                const value = features[key];
                if (value.exit !== null) exitsCount += 1;
                if (value.entrance !== null) entrancesCount += 1;
            }

            expect(entrancesCount).to.equal(1);
            expect(exitsCount).to.equal(2);
        });
    });


    describe ('extractAveragePath', () => {
        // https://gist.github.com/Alystrasz/335b43cf0b497961ff4648c4033e57e3
        it ('should return same path when there\'s only one', () => {
            const node = buildZOI(inriaZOI, [inriaBoundariesPath]);
            const path = extractAveragePaths(node)[0];
            expect(path.geometry!.coordinates).to.deep.equal(inriaBoundariesPath.geometry!.coordinates);
            expect(path.properties!.weight).to.equal(1);
        });

        it ('should throw if node has no paths', () => {
            const node = buildZOI(inriaZOI, []);
            expect(() => extractAveragePaths(node))
                .to.throw(
                    RangeError,
                    'Cannot extract average locations from a node having no paths.'
                );
        });

        // https://gist.github.com/Alystrasz/4c4e538ede57d7d6c2c5ebc30483d10e
        it ('should compute average path with two input paths sharing same ZOI boundaries', () => {
            const node = buildZOI(inriaZOI, [inriaBoundariesPath, inriaBoundariesPath2]);

            const path = extractAveragePaths(node)[0];
            expect(path.properties!.weight).to.equal(2);
            expect(path.geometry!.coordinates.length).to.equal(2);

            const topAveragePosition =
                midpoint(inriaBoundariesPath.geometry!.coordinates[0], inriaBoundariesPath2.geometry!.coordinates[0]);
            const leftAveragePosition =
                midpoint(inriaBoundariesPath.geometry!.coordinates[1], inriaBoundariesPath2.geometry!.coordinates[1]);

            expect(path.geometry!.coordinates[0][0])
                .to.be.approximately(topAveragePosition.geometry!.coordinates[0], 0.0000000001);
            expect(path.geometry!.coordinates[0][1])
                .to.be.approximately(topAveragePosition.geometry!.coordinates[1], 0.0000000001);

            expect(path.geometry!.coordinates[1][0])
                .to.be.approximately(leftAveragePosition.geometry!.coordinates[0], 0.0000000001);
            expect(path.geometry!.coordinates[1][1])
                .to.be.approximately(leftAveragePosition.geometry!.coordinates[1], 0.0000000001);
        });

        // https://gist.github.com/Alystrasz/9ebe7080d2386a5c1452bbc97a8e7e6d
        it ('should export two paths with different weights', () => {
            const node = buildZOI(citeScientifiqueCampus, [campusPath1, campusPath2, campusPath3]);
            const paths = extractAveragePaths(node);

            expect(paths.length).to.equal(2);
            expect(paths[0].properties!.weight).to.equal(1);
            expect(paths[1].properties!.weight).to.equal(2);
        });

        // https://gist.github.com/Alystrasz/e1108e0ce9c4efc3d004caac418dbcd5
        it ('should export two paths with input paths going opposite directions', () => {
            const node = buildZOI(
                citeScientifiqueCampus,
                [campusFromTopToBottom1, campusFromTopToBottom2, campusFromBottomToTop1, campusFromBottomToTop2]
            );

            const paths = extractAveragePaths(node);
            expect(paths.length).to.equal(2);

            const pathFromTopToBottom = paths[0];
            expect(pathFromTopToBottom.properties!.weight).to.equal(2);
            expect(pathFromTopToBottom.geometry!.coordinates[0][1]).to.be.approximately(50.613691567770175, 0.000000000000001);
            expect(pathFromTopToBottom.geometry!.coordinates[1][1]).to.be.approximately(50.60466337537547, 0.000000000000001);

            const pathFromBottomToTop = paths[1];
            expect(pathFromBottomToTop.properties!.weight).to.equal(2);
            expect(pathFromBottomToTop.geometry!.coordinates[0][1]).to.be.approximately(50.60466337537547, 0.000000000000001);
            expect(pathFromBottomToTop.geometry!.coordinates[1][1]).to.be.approximately(50.613691567770175, 0.000000000000001);
        });

        // https://gist.github.com/Alystrasz/48eb79e6971fb73adb4ca8e664c5a689
        it ('should export two paths with one input path having no exit', () => {
            const node = buildZOI(citeScientifiqueCampus, [campusPath1, campusNoExitPath]);
            const paths = extractAveragePaths(node);
            expect(paths.length).to.equal(2);

            const path1 = paths[0];
            const lastCoordinates = path1.geometry!.coordinates[path1.geometry!.coordinates.length-1];
            expect(path1.properties!.weight).to.equal(1);
            expect(path1.geometry!.coordinates[1]).to.deep.equal(lastCoordinates);

            const path2 = paths[1];
            expect(path2.properties!.weight).to.equal(1);
            expect(path2.geometry!.coordinates[1]).to.deep.equal(campusNoExitPath.geometry!.coordinates[1]);

            // both paths should have same origin
            expect(path1.geometry!.coordinates[0]).to.deep.equal(path2.geometry!.coordinates[0]);
        });

        // https://gist.github.com/Alystrasz/3e4d63380ce1ce9ea90dff718f2de4e2
        it ('should export two paths with one input path having no entrance', () => {
            const node = buildZOI(citeScientifiqueCampus, [campusPath1, campusNoEntrancePath]);
            const paths = extractAveragePaths(node);
            expect(paths.length).to.equal(2);

            const path1 = paths[0];
            expect(path1.properties!.weight).to.equal(1);
            expect(path1.geometry!.coordinates[0]).to.deep.equal(campusPath1.geometry!.coordinates[0]);

            const path2 = paths[1];
            expect(path2.properties!.weight).to.equal(1);
            expect(path2.geometry!.coordinates[0]).to.deep.equal(campusNoEntrancePath.geometry!.coordinates[0]);

            // both paths should have same exit
            const path1ExitCoordinates = path1.geometry!.coordinates[path1.geometry!.coordinates.length-1];
            expect(path1ExitCoordinates).to.deep.equal(path2.geometry!.coordinates[1]);
        });

        // https://gist.github.com/Alystrasz/b7cbdb1dfec9fe5bb2ee99e2463481e4
        it ("should export one path with exit on ZOI's edge", () => {
            const node = buildZOI(citeScientifiqueCampus, [campusExitOnEdgePath1, campusExitOnEdgePath2]);
            const paths = extractAveragePaths(node);

            expect(paths.length).to.equal(1);
            expect(paths[0].geometry!.coordinates[1]).to.deep.equal(campusExitOnEdgePath1.geometry!.coordinates[1]);
        });

        // https://gist.github.com/Alystrasz/68feb6dfec27ae0774dc55227827fae4
        it ("should export two paths from one ZOI's vertex", () => {
            const node = buildZOI(citeScientifiqueCampus, [campusEntranceOnVertexPath1, campusEntranceOnVertexPath2]);
            const paths = extractAveragePaths(node);

            expect(paths.length).to.equal(2);
            expect(
                paths[0].geometry!.coordinates[0]
            ).to.deep.equal(
                paths[1].geometry!.coordinates[0]
            );
        });

        // https://gist.github.com/Alystrasz/697004ed8f3795f9d6c4031f7533cf81
        it ("should extract one path linking two ZOI's vertexes", () => {
            const node = buildZOI(citeScientifiqueCampus, [campusVertexToVertexPath]);
            const paths = extractAveragePaths(node);

            expect(paths.length).to.equal(1);
            expect(paths[0].geometry!.coordinates).to.deep.equal(campusVertexToVertexPath.geometry!.coordinates);
        });

        // https://gist.github.com/Alystrasz/f2a0ecb91362dd30f45f32b8ae85746a
        // result (colored) => https://gist.github.com/Alystrasz/a9f647a75b99a4fc7b7f1f24510a38c5
        it ('should extract 4 paths from various input paths', () => {
            const node = buildZOI(
                citeScientifiqueCampus,
                [
                    campusVertexToVertexPath, campusVertexToBottomPath,
                    campusFromTopToBottom1, campusFromTopToBottom2,
                    campusFromBottomToTop1, campusFromBottomToTop2
                ]
            );
            const paths = extractAveragePaths(node);
            expect(paths.length).to.equal(4);
        });

        // https://gist.github.com/Alystrasz/9d3f6fc466fec4d58449ec08daed39ac
        it ('should not extract any path with an input path strictly included in ZOI', () => {
            const node = buildZOI(citadel, [innerCitadelLine]);
            const paths = extractAveragePaths(node);
            expect(paths.length).to.equal(0);
        });

        // https://gist.github.com/Alystrasz/f84276506f301ea0097e69a54232e507
        it ('should not return anything with paths strictly included in ZOI', () => {
            const node = buildZOI(citadel, innerCitadelPaths);
            const paths = extractAveragePaths(node);
            expect(paths.length).to.equal(0);
        });

        // https://gist.github.com/Alystrasz/d733a8979fcdd53515664e4b7f4231e3
        it ('should extract 2 paths with a path along ZOI boundary', () => {
            const node = buildZOI(citadelSubZone, [aroundCitadelPath1, aroundCitadelPath2]);
            const paths = extractAveragePaths(node);

            expect(paths.length).to.equal(2);
            expect(paths[0].geometry!.coordinates[1])
                .to.deep.equal(paths[1].geometry!.coordinates[1]);
        });
    });
});
