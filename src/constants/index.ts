export enum MazeGen {
    RecursiveBacktracker = "Recursive Backtracker",
    RecursiveDivision = "Recursive Division",
    RandomizedPrim = "Randomized Prim's",
    RandomizedKruskal = "Randomized Kruskal's",
    RandomWalls = "Random Walls",
    SimpleWall = "Simple Wall",
    None = "None",
}

export enum PathfindingAlgorithm {
    BreadthFirstSearch = "Breadth-First Search",
    DepthFirstSearch = "Depth-First Search",
    GreedyBestFirstSearch = "Greedy Best-First Search",
    AStar = "A* Search",
}

export enum GridSize {
    Small = "Small",
    Medium = "Medium",
    Large = "Large",
}

export enum Speed {
    Pause = "Pause",
    Slow = "Slow",
    Medium = "Medium",
    Fast = "Fast",
}

export const COLORS = {
    gunmetal: "#29343D",
    gunmetalLight: "#394956",
    malachite: "#2EDC76",
    malachiteDark: "#21C063",
    malachiteDisabled: "#188C48",
    tomato: "#FF6347",
    tomatoDark: "#CC4F39",
    celestialBlue: "#2697E3",
    celestialBlueDark: "#1776B5",
    silver: "#ADADAD",
    timberwolf: "#DADADA",
};
