import {ClusteringTreeNode} from "./ClusteringTreeNode";
import {buildZOI, splitNode} from "../compute/zonesBuilding";
import {Feature, FeatureCollection, LineString, Polygon} from "@turf/helpers";
import {extractAveragePaths} from "../compute/graphExtraction";

export class ClusteringTree {
    public root: ClusteringTreeNode;


    constructor (rootNode: ClusteringTreeNode, depth: number) {
        if (depth < 0)
            throw new RangeError(`Tree depth must be superior or equal to zero (was ${depth}).`)
        this.root = this.buildTree(rootNode, depth);
    }

    static create (
        zoneOfInterest: Feature<Polygon>,
        paths: Feature<LineString>[],
        depth: number
    ): ClusteringTree {
        const rootNode = buildZOI(zoneOfInterest, paths);
        return new ClusteringTree(rootNode, depth);
    }


    /**
     * Builds the clustering tree by starting from the root node and splitting it as many times as wanted.
     *
     * @param root tree root node
     * @param depth level of tree depth
     */
    buildTree (
        root: ClusteringTreeNode,
        depth: number
    ): ClusteringTreeNode {
        if (depth > 0)
            this.buildNodeChildren(root, depth);

        return root;
    }


    buildNodeChildren (node: ClusteringTreeNode, depth: number): any {
        if (depth === 0) {
            return null;
        }

        node.children = this.splitNode(node);
        for (const child of node.children) {
            child.parent = node;
            this.buildNodeChildren(child, depth-1);
        }
    }

    /**
     * If you wish to discretize zones differently, change this implementation.
     * @param node
     */
    splitNode (node: ClusteringTreeNode): ClusteringTreeNode[] {
        return splitNode(node);
    }


    /**
     * Return nodes at the end of the current tree.
     */
    getLeafNodes (): ClusteringTreeNode[] {
        const leaves: ClusteringTreeNode[] = [];

        function lookForLeaves(node: ClusteringTreeNode): void {
            if (node.children.length === 0)
                leaves.push(node);
            else
                for (const child of node.children)
                    lookForLeaves(child);
        }

        if (this.root.children.length !== 0)
            lookForLeaves(this.root);
        else
            leaves.push(this.root);

        return leaves;
    }


    /**
     * Returns an array of average paths for this tree.
     * Starting from leaf nodes, this gathers average paths with associated popularity.
     */
    extractAveragePaths (): Feature<LineString>[] {
        let averagePaths: Feature<LineString>[] = [];

        for (const leaf of this.getLeafNodes()) {
            if (leaf.paths.length !== 0)
                averagePaths = averagePaths.concat(...extractAveragePaths(leaf));
        }

        return averagePaths;
    }


    /**
     * Returns a collection of features from leaf nodes.
     * The returned collection only contains average paths by default; input paths and zones of interest can be
     * included as well.
     *
     * @param exportOriginalPaths should export input paths
     * @param exportZonesOfInterest should export zones of interest
     */
    toFeatureCollection (
        exportOriginalPaths: boolean = false,
        exportZonesOfInterest: boolean = false
    ): FeatureCollection {

        const features: Feature[] = [];
        const leaves = this.getLeafNodes();

        for (const leaf of leaves) {
            if (exportZonesOfInterest)
                features.push(leaf.zoneOfInterest);

            // average paths
            if (leaf.paths.length !== 0) {
                for (const averagePath of extractAveragePaths(leaf)) {
                    averagePath.properties!['stroke-width'] = averagePath.properties!.weight*5;
                    averagePath.properties!['stroke'] = '#ff5555';
                    features.push( averagePath );
                }
            }

            if (exportOriginalPaths)
                features.push(...leaf.paths);
        }

        return {
            type: 'FeatureCollection',
            features: features
        }
    }
}
