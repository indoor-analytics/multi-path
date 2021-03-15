import { ClusteringTreeNode } from "./ClusteringTreeNode";
import { Feature, FeatureCollection, LineString, Polygon } from "@turf/helpers";
export declare class ClusteringTree {
    root: ClusteringTreeNode;
    constructor(rootNode: ClusteringTreeNode, depth: number);
    static create(zoneOfInterest: Feature<Polygon>, paths: Feature<LineString>[], depth: number): ClusteringTree;
    /**
     * Builds the clustering tree by starting from the root node and splitting it as many times as wanted.
     *
     * @param root tree root node
     * @param depth level of tree depth
     */
    buildTree(root: ClusteringTreeNode, depth: number): ClusteringTreeNode;
    buildNodeChildren(node: ClusteringTreeNode, depth: number): any;
    /**
     * If you wish to discretize zones differently, change this implementation.
     * @param node
     */
    splitNode(node: ClusteringTreeNode): ClusteringTreeNode[];
    /**
     * Return nodes at the end of the current tree.
     */
    getLeafNodes(): ClusteringTreeNode[];
    /**
     * Returns an array of average paths for this tree.
     * Starting from leaf nodes, this gathers average paths with associated popularity.
     */
    extractAveragePaths(): Feature<LineString>[];
    /**
     * Returns a collection of features from leaf nodes.
     * The returned collection only contains average paths by default; input paths and zones of interest can be
     * included as well.
     *
     * @param exportOriginalPaths should export input paths
     * @param exportZonesOfInterest should export zones of interest
     */
    toFeatureCollection(exportOriginalPaths?: boolean, exportZonesOfInterest?: boolean): FeatureCollection;
}
