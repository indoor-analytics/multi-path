import {buildZOI} from "../../src/compute/zonesBuilding";
import {actualFlandersRailway} from "../features/testZones";
import {ClusteringTree} from "../../src/classes/ClusteringTree";
import {printCollectionToFile} from "../../src/compute/display";
import {runs} from "./runs";

const node = buildZOI(actualFlandersRailway, runs);

const tree = new ClusteringTree(node, 0);
printCollectionToFile(
    tree.toFeatureCollection(true, false),
    'originalPaths.json'
);

const tree1 = new ClusteringTree(node, 1);
printCollectionToFile(
    tree1.toFeatureCollection(false, false),
    'depth1.json'
);

const tree2 = new ClusteringTree(node, 2);
printCollectionToFile(
    tree2.toFeatureCollection(false, false),
    'depth2.json'
);

const tree3 = new ClusteringTree(node, 3);
printCollectionToFile(
    tree3.toFeatureCollection(false, false),
    'depth3.json'
);

const tree4 = new ClusteringTree(node, 4);
printCollectionToFile(
    tree4.toFeatureCollection(false, false),
    'depth4.json'
);

const tree5 = new ClusteringTree(node, 5);
printCollectionToFile(
    tree5.toFeatureCollection(false, false),
    'depth5.json'
);

const tree6 = new ClusteringTree(node, 6);
printCollectionToFile(
    tree6.toFeatureCollection(false, false),
    'depth6.json'
);

const tree7 = new ClusteringTree(node, 7);
printCollectionToFile(
    tree7.toFeatureCollection(false, false),
    'depth7.json'
);
