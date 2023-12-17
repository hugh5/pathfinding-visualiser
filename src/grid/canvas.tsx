import { useContext } from "react";
import { AppContext } from "../context/appstate";
import { squareSketch } from "./squarecanvas";
import { ReactP5Wrapper } from "@p5-wrapper/react";

const Canvas = () => {
    const { speed } = useContext(AppContext);
    return (
        <div className="canvas-container">
            <ReactP5Wrapper sketch={squareSketch} speed={speed} />
        </div>
    );
};

export default Canvas;
