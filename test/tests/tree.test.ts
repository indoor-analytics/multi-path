import {buildZOI} from "../../src/compute/zonesBuilding";
import {citadel} from "../features/testZones";
import {aroundCitadelPath1, aroundCitadelPath2, innerCitadelPaths} from "../features/testPaths";
import {expect} from "chai";
import {ClusteringTree} from "../../src/classes/ClusteringTree";

describe ('Tree building and parsing', () => {
    describe ('Building the tree', () => {
        it ('should build a tree with no depth', () => {
            const node = buildZOI(citadel, innerCitadelPaths);
            const tree = new ClusteringTree(node, 0);
            expect(tree.root).to.deep.equal(node);
        });

        it ('should not build a tree with a negative depth', () => {
            const node = buildZOI(citadel, innerCitadelPaths);
            expect(() => {
                new ClusteringTree(node, -1);
            }).to.throw(RangeError, 'Tree depth must be superior or equal to zero (was -1).');
        });

        it ('should throw an error message with wrong input depth', () => {
            const node = buildZOI(citadel, innerCitadelPaths);
            expect(() => {
                new ClusteringTree(node, -42);
            }).to.throw(RangeError, 'Tree depth must be superior or equal to zero (was -42).');
        });

        it ('should build a tree with depth = 1', () => {
            const tree = ClusteringTree.create(citadel, innerCitadelPaths, 1);
            expect(tree.root.children.length).to.not.equal(0);
            expect(tree.root.children).to.not.deep.include(tree.root);
        });

        it ('should build a tree with depth = 2', () => {
            const tree = ClusteringTree.create(citadel, innerCitadelPaths, 2);
            expect(tree.root.children.length).to.equal(4);

            for (const child of tree.root.children) {
                expect(child.children.length).to.equal(4);
            }
        });

        it ('should build a tree with depth = 5', () => {
            const node = buildZOI(citadel, innerCitadelPaths);
            const tree = new ClusteringTree(node, 5);

            let depth = 0;
            let currentNode = tree.root;

            while (currentNode.children.length !== 0) {
                depth += 1;
                expect(currentNode.children.length).to.equal(4);
                currentNode = currentNode.children[0];
            }

            expect(depth).to.equal(5);
        });

        it ('should build a tree with linked nodes', () => {
            const tree = ClusteringTree.create(citadel, innerCitadelPaths, 5);

            let currentNode = tree.root;
            let depth = 0;

            // going down the tree
            while (currentNode.children.length !== 0) {
                currentNode = currentNode.children[0];
                depth += 1;
            }

            expect(depth).to.equal(5);

            // going up the tree
            while (currentNode.parent !== null) {
                currentNode = currentNode.parent;
                depth -= 1;
            }

            expect(currentNode.parent).to.equal(null);
            expect(depth).to.equal(0);
        });
    });


    describe ('create', () => {
        it ('should create root node', () => {
            const node = buildZOI(citadel, innerCitadelPaths);
            const tree = ClusteringTree.create(citadel, innerCitadelPaths, 0);
            expect(tree.root).to.deep.equal(node);
        });

        it ('should not create tree with a negative depth', () => {
            expect(() => {
                ClusteringTree.create(citadel, innerCitadelPaths, -42);
            }).to.throw(RangeError, 'Tree depth must be superior or equal to zero (was -42).');
        });

        it ('should build a tree with depth = 5', () => {
            const tree = ClusteringTree.create(citadel, innerCitadelPaths, 5);

            let depth = 0;
            let currentNode = tree.root;

            while (currentNode.children.length !== 0) {
                depth += 1;
                currentNode = currentNode.children[0];
            }

            expect(depth).to.equal(5);
        });
    });


    describe ('getLeafNodes', () => {
        it ('should only have root node as leaf with depth = 0', () => {
            const tree = ClusteringTree.create(citadel, innerCitadelPaths, 0);
            const children = tree.getLeafNodes();
            expect(children.length).to.equal(1);
        });

        it ('should have four children with depth = 1', () => {
            const tree = ClusteringTree.create(citadel, innerCitadelPaths, 1);
            const children = tree.getLeafNodes();
            expect(children.length).to.equal(4);
        });

        it ('should have sixteen children with depth = 2', () => {
            const tree = ClusteringTree.create(citadel, innerCitadelPaths, 2);
            const children = tree.getLeafNodes();
            expect(children.length).to.equal(16);
        });

        it ('should have 1024 children with depth = 5', () => {
            const tree = ClusteringTree.create(citadel, innerCitadelPaths, 5);
            const children = tree.getLeafNodes();
            expect(children.length).to.equal(1024);
        });

        it ('should have 4096 children with depth = 6 (4^6)', () => {
            const tree = ClusteringTree.create(citadel, innerCitadelPaths, 6);
            const children = tree.getLeafNodes();
            expect(children.length).to.equal(4096);
        });
    });
});

describe ('Tree graph extraction', () => {
    describe ('extractAveragePaths', () => {
        it ('should extract at least one path', () => {
            const node = buildZOI(citadel, innerCitadelPaths);
            const tree = new ClusteringTree(node, 5);
            const paths = tree.extractAveragePaths();
            expect(paths.length).to.not.equal(0);
        });

        // https://gist.github.com/Alystrasz/bd2ebc9027f7835fd5c7814512d21713
        it ('should extract 6 paths from node with depth = 1', () => {
            const node = buildZOI(citadel, [aroundCitadelPath1, aroundCitadelPath2]);
            const tree = new ClusteringTree(node, 1);

            const paths = tree.extractAveragePaths();
            expect(paths.length).to.equal(6);

            let weightOf1Count = 0,
                weightOf2Count = 0;
            for (const path of paths) {
                switch (path.properties!.weight) {
                    case 1:
                        weightOf1Count += 1;
                        break;
                    case 2:
                        weightOf2Count += 1;
                        break;
                    default:
                        expect.fail(`Only expecting paths with weights of 1 and 2, received one with weight = ${path.properties!.weight}.`);
                        break;
                }
            }
            expect(weightOf2Count).to.equal(2);
            expect(weightOf1Count).to.equal(4);
        });

        // expected (hand-drawn): https://gist.github.com/Alystrasz/d93190b4496fc11167b78a511522496a
        // result (computed): https://gist.github.com/Alystrasz/826d91543b824a07eee7ef68dabbb430
        it ('should extract 25 paths from 2-depth tree', () => {
            const node = buildZOI(citadel, [aroundCitadelPath1, aroundCitadelPath2]);
            const tree = new ClusteringTree(node, 2);
            const paths = tree.extractAveragePaths();
            expect(paths.length).to.equal(25);
        });
    });


    describe ('toFeatureCollection', () => {
        it ('should not export any paths without clustering', () => {
            const tree = ClusteringTree.create(citadel, innerCitadelPaths, 0);
            const collection = tree.toFeatureCollection();
            expect(collection.features.length).to.equal(0);
        });

        it ('should export input paths without clustering', () => {
            const tree = ClusteringTree.create(citadel, innerCitadelPaths, 0);
            const collection = tree.toFeatureCollection(true);
            expect(collection.features.length).to.equal(innerCitadelPaths.length);
        });

        it ('should export ZOI + input paths without clustering', () => {
            const tree = ClusteringTree.create(citadel, innerCitadelPaths, 0);
            const collection = tree.toFeatureCollection(true, true);
            expect(collection.features.length).to.equal(innerCitadelPaths.length + 1);
        });

        it ('should export ZOI alone without clustering', () => {
            const tree = ClusteringTree.create(citadel, innerCitadelPaths, 0);
            const collection = tree.toFeatureCollection(false, true);
            expect(collection.features.length).to.equal(1);
        });

        // https://gist.github.com/Alystrasz/826d91543b824a07eee7ef68dabbb430
        it ('should export 25 average paths', () => {
            const tree = ClusteringTree.create(citadel, [aroundCitadelPath1, aroundCitadelPath2], 2);
            const collection = tree.toFeatureCollection();
            expect(collection.features.length).to.equal(25);
        });

        // https://gist.github.com/Alystrasz/826d91543b824a07eee7ef68dabbb430
        it ('should export average paths + all ZOIs', () => {
            const tree = ClusteringTree.create(citadel, [aroundCitadelPath1, aroundCitadelPath2], 2);
            const collection = tree.toFeatureCollection(false, true);

            // expecting 25 average paths + 16 zones of interest
            expect(collection.features.length).to.equal(25 + 16);
        });

        // https://gist.github.com/Alystrasz/826d91543b824a07eee7ef68dabbb430
        it ('should export original paths segments + average paths', () => {
            const tree = ClusteringTree.create(citadel, [aroundCitadelPath1, aroundCitadelPath2], 2);
            const collection = tree.toFeatureCollection(true, false);

            // expecting 27 path segments + 25 average paths
            expect(collection.features.length).to.equal(27 + 25);
        });

        // https://gist.github.com/Alystrasz/826d91543b824a07eee7ef68dabbb430
        it ('should export all features', () => {
            const tree = ClusteringTree.create(citadel, [aroundCitadelPath1, aroundCitadelPath2], 2);
            const collection = tree.toFeatureCollection(true, true);

            // expecting 27 path segments + 25 average paths + 16 zones of interest
            expect(collection.features.length).to.equal(27 + 25 + 16);
        });
    });
});
