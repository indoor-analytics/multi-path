import {getZOIBoundaries, isPointAZOIVertex, isPointOnZOIBoundaries} from "../../src/compute/zoiUtils";
import {citadel, dunkirkHexagon, trainStationZoneOfInterest} from "../features/testZones";
import {expect} from "chai";
import {point} from "@turf/helpers";


describe('ZOI utils', () => {
    describe ('isPointOnZOIBoundaries', () => {
        // https://gist.github.com/Alystrasz/09431cd8c2c2b87faec05fceb75ca078
        it ('should find out point is on boundaries', () => {
            const position = [3.0382776260375977, 50.6422081809365];
            const result = isPointOnZOIBoundaries(position, citadel);
            expect(result).to.equal(true);
        });

        // https://gist.github.com/Alystrasz/814713aaf4799b5d4930eeee7f069c2b
        it ('should find out point is not on boundaries', () => {
            const position = [3.0522380599975585, 50.63962266187202];
            const result = isPointOnZOIBoundaries(position, citadel);
            expect(result).to.equal(false);
        });

        // https://gist.github.com/Alystrasz/93a19e2025ba7ce2c1017176dd71bd97
        it ('should find out ZOI edge is on boundaries', () => {
            const position = [3.0382776260375977, 50.63713226428859];
            const result = isPointOnZOIBoundaries(position, citadel);
            expect(result).to.equal(true);
        });

        // https://gist.github.com/Alystrasz/6f2bfe5d557ce17c133fb5e93e6aa8cc
        it ('should find out point inside ZOI is not on boundaries', () => {
            const position = [3.0471396446228027, 50.643364814465016];
            const result = isPointOnZOIBoundaries(position, citadel);
            expect(result).to.equal(false);
        });
    });


    describe ('isPointAZOIVertex', () => {
        // https://gist.github.com/Alystrasz/f24f5cb0095ee0df0cbf5f33a167908d
        it ("should return true with a ZOI's vertex", () => {
            const position = point([3.0382776260375977, 50.64535143619798]);
            const result = isPointAZOIVertex(position, citadel);
            expect(result).to.equal(true);
        });

        // https://gist.github.com/Alystrasz/09431cd8c2c2b87faec05fceb75ca078
        it ('should return false with a point on ZOI boundaries', () => {
            const position = point([3.0382776260375977, 50.6422081809365]);
            const result = isPointAZOIVertex(position, citadel);
            expect(result).to.equal(false);
        });

        // https://gist.github.com/Alystrasz/814713aaf4799b5d4930eeee7f069c2b
        it ('should return false with a point outside ZOI', () => {
            const position = point([3.0522380599975585, 50.63962266187202]);
            const result = isPointAZOIVertex(position, citadel);
            expect(result).to.equal(false);
        });

        // https://gist.github.com/Alystrasz/6f2bfe5d557ce17c133fb5e93e6aa8cc
        it ('should return false with a point inside ZOI', () => {
            const position = point([3.0471396446228027, 50.643364814465016]);
            const result = isPointAZOIVertex(position, citadel);
            expect(result).to.equal(false);
        });

        // https://gist.github.com/Alystrasz/b696250827260c9c7388df0dfa415228
        it ("should return true with a complex ZOI's vertex", () => {
            const position = point([3.0717878043651576, 50.63554933029314]);
            const result = isPointAZOIVertex(position, trainStationZoneOfInterest);
            expect(result).to.equal(true);
        });
    });


    describe ('getZOIBoundaries', () => {
        it ('should return 4 boundaries on a rectangular ZOI', () => {
            const boundaries = getZOIBoundaries(citadel);
            expect(boundaries.length).to.equal(4);
        });

        it ('should return correct boundaries count for a complex ZOI', () => {
            const boundaries = getZOIBoundaries(trainStationZoneOfInterest);
            const locationsCount = trainStationZoneOfInterest.geometry!.coordinates[0].length;
            expect(boundaries.length).to.equal(33);
            expect(boundaries.length).to.equal(locationsCount-1);   // first location is duplicated in polygons
        });

        it ('should return 6 boundaries for an hexagonal ZOI', () => {
            const boundaries = getZOIBoundaries(dunkirkHexagon);
            expect(boundaries.length).to.equal(6);
        });
    });
});
