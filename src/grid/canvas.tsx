import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/appstate";
import { squareSketch } from "./squarecanvas";
import { ReactP5Wrapper } from "@p5-wrapper/react";

declare global {
    interface Window {
        updateState: ((state: { mazeGenerated: boolean }) => void) | undefined;
    }
}

const Canvas = () => {
    const { mazeGen, algorithm, gridSize, speed } = useContext(AppContext);

    const [pState, setPState] = useState({ mazeGenerated: false });

    useEffect(() => {
        window.updateState = (state: { mazeGenerated: boolean }) =>
            setPState(state);

        return () => {
            window.updateState = undefined;
        };
    }, []);

    return (
        <div>
            <div className="canvas-container">
                <ReactP5Wrapper
                    sketch={squareSketch}
                    mazeGen={mazeGen}
                    algorithm={algorithm}
                    gridSize={gridSize}
                    speed={speed}
                />
            </div>
        </div>
    );
};

export default Canvas;
