import React, { createContext, useLayoutEffect, useState } from "react";

import {
    GridType,
    MazeGen,
    PathfindingAlgorithm,
    RunningState,
    Speed,
} from "../constants";

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
        PathfindingAlgorithm.Dijkstra
    );
    const [gridType, setGridType] = useState<string>(GridType.Square);
    const [speed, setSpeed] = useState<string>(Speed.Fast);
    const [running, setRunning] = useState<string>(RunningState.READY);

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
                gridType,
                setGridType,
                speed,
                setSpeed,
                running,
                setRunning,
                windowSize,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
