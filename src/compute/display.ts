import * as fs from "fs";
import {FeatureCollection} from "@turf/helpers";

export function printCollectionToFile (
    collection: FeatureCollection,
    filename: string = 'node.json'
): void {
    const outputDir = 'output/';
    if (!fs.existsSync(outputDir))
        fs.mkdirSync(outputDir);
    fs.writeFileSync(outputDir + filename, JSON.stringify(collection));
}
