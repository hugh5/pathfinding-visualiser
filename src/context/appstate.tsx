import React, { createContext, useLayoutEffect, useState } from "react";

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

    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    useLayoutEffect(() => {
        function onWindowResize(event: any) {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        window.addEventListener("resize", onWindowResize);
        return () => {
            window.removeEventListener("resize", onWindowResize);
        };
    }, []);

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
                windowSize,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
