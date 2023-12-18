export enum MazeGen {
    RecursiveBacktracker = "Recursive Backtracker",
    RecursiveDivision = "Recursive Division",
    RandomWalls = "Random Walls",
    RandomizedPrim = "Randomized Prim's",
    RandomizedKruskal = "Randomized Kruskal's",
}

export enum PathfindingAlgorithm {
    Dijkstra = "Dijkstra's",
    AStar = "A*",
    GreedyBestFirstSearch = "Greedy Best-First Search",
    BreadthFirstSearch = "Breadth-First Search",
    DepthFirstSearch = "Depth-First Search",
}

export enum GridType {
    Square = "Square",
    Graph = "Graph",
    Hexagonal = "Hexagonal",
    Circular = "Circular",
}

export enum Speed {
    Fast = "Fast",
    Medium = "Medium",
    Slow = "Slow",
}

export enum RunningState {
    READY = "READY",
    RUNNING = "RUNNING",
    FINISHED = "FINISHED",
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
