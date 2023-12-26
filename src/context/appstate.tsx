import React, { createContext, useState } from "react";

import { GridSize, MazeGen, PathfindingAlgorithm, Speed } from "../constants";

export const AppContext = createContext<any>(null);

export function AppContextProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mazeGen, setMazeGen] = useState<string>(
        MazeGen.RecursiveBacktracker
    );
    const [algorithm, setAlgorithm] = useState<string>(
        PathfindingAlgorithm.BreadthFirstSearch
    );
    const [gridSize, setGridSize] = useState<string>(GridSize.Medium);
    const [speed, setSpeed] = useState<string>(Speed.Fast);
    const [volume, setVolume] = useState<number>(0);

    return (
        <AppContext.Provider
            value={{
                mazeGen,
                setMazeGen,
                algorithm,
                setAlgorithm,
                gridSize,
                setGridSize,
                speed,
                setSpeed,
                volume,
                setVolume,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
