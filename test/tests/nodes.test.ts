import {addWaysToPath, buildZOI} from "../../src/compute/zonesBuilding";
import {citadel} from "../features/testZones";
import {innerCitadelPaths} from "../features/testPaths";
import {expect} from "chai";

describe ('Nodes handling', () => {
    describe ('Clustering tree node', () => {
        it ('should convert to feature collection', () => {
            const node = buildZOI(citadel, innerCitadelPaths);
            const geojson = node.toFeatureCollection();
            expect(geojson.features).to.deep.include(citadel);
            expect(geojson.features).to.deep.include.members(innerCitadelPaths.map(path => addWaysToPath(path, citadel)));
        });
    });
});
