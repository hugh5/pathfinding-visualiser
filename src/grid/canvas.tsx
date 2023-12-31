import { useContext } from "react";
import { AppContext } from "../context/appstate";
import { squareSketch } from "./squarecanvas";
import { ReactP5Wrapper } from "@p5-wrapper/react";

const Canvas = () => {
    const { mazeGen, algorithm, gridSize, speed, volume } =
        useContext(AppContext);

    return (
        <div>
            <div className="canvas-container">
                <ReactP5Wrapper
                    sketch={squareSketch}
                    mazeGen={mazeGen}
                    algorithm={algorithm}
                    gridSize={gridSize}
                    speed={speed}
                    volume={volume}
                />
            </div>
        </div>
    );
};

export default Canvas;
