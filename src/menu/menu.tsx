import React, { useContext, useEffect, useRef, useState } from "react";
import { IoLogoGithub } from "react-icons/io";
import { FaPlay, FaRotateLeft, FaStop } from "react-icons/fa6";
import { RxQuestionMark } from "react-icons/rx";
import { SlArrowDown } from "react-icons/sl";
import { AppContext } from "../context/appstate";
import { GridSize, MazeGen, PathfindingAlgorithm, Speed } from "../constants";

const Menu = () => {
    const mazeRef = useRef(null);
    const pathfindingRef = useRef(null);
    const gridRef = useRef(null);
    const speedRef = useRef(null);

    const {
        mazeGen,
        setMazeGen,
        algorithm,
        setAlgorithm,
        gridSize,
        setGridSize,
        speed,
        setSpeed,
        windowSize,
    } = useContext(AppContext);

    const [dropdown, setDropdown] = useState<string | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (
                mazeRef.current &&
                !(mazeRef.current as HTMLElement).contains(event.target) &&
                pathfindingRef.current &&
                !(pathfindingRef.current as HTMLElement).contains(
                    event.target
                ) &&
                gridRef.current &&
                !(gridRef.current as HTMLElement).contains(event.target) &&
                speedRef.current &&
                !(speedRef.current as HTMLElement).contains(event.target)
            ) {
                setDropdown(null);
            }
        };
        document.addEventListener("click", handleClickOutside, true);
        return () => {
            document.removeEventListener("click", handleClickOutside, true);
        };
    }, []);

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: windowSize.width < 600 ? "column" : "row",
                padding: "0 " + windowSize.width * 0.1 + "px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                <h3 style={{ margin: 0 }}>Pathfinding Visualiser</h3>
                <a className="github-link" href="https://www.github.com/hugh5">
                    <p className="github">hugh5</p>
                    <IoLogoGithub />
                </a>
            </div>
            <div className="container">
                <div className="dropdown">
                    <div className="dropdown-caption">
                        Maze Generation:
                        <RxQuestionMark />
                    </div>
                    <button
                        className="dropdown-btn"
                        ref={mazeRef}
                        onClick={() =>
                            setDropdown(
                                dropdown === "mazeGen" ? null : "mazeGen"
                            )
                        }
                    >
                        {mazeGen}
                        <SlArrowDown />
                    </button>

                    <div
                        className="dropdown-content"
                        style={{
                            display: dropdown === "mazeGen" ? "" : "none",
                        }}
                    >
                        {Object.keys(MazeGen).map((key: string) => (
                            <button
                                className="dropdown-item"
                                key={key}
                                onClick={() => {
                                    setMazeGen(
                                        MazeGen[key as keyof typeof MazeGen]
                                    );
                                    setDropdown(null);
                                }}
                            >
                                {MazeGen[key as keyof typeof MazeGen]}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="dropdown">
                    <div className="dropdown-caption">
                        Pathfinding Algorithm:
                        <RxQuestionMark />
                    </div>
                    <button
                        className="dropdown-btn"
                        ref={pathfindingRef}
                        onClick={() =>
                            setDropdown(
                                dropdown === "pathfindingAlgorithm"
                                    ? null
                                    : "pathfindingAlgorithm"
                            )
                        }
                    >
                        {algorithm}
                        <SlArrowDown />
                    </button>
                    <div
                        className="dropdown-content"
                        style={{
                            display:
                                dropdown === "pathfindingAlgorithm"
                                    ? ""
                                    : "none",
                        }}
                    >
                        {Object.keys(PathfindingAlgorithm).map(
                            (key: string) => (
                                <button
                                    className="dropdown-item"
                                    key={key}
                                    onClick={() => {
                                        setAlgorithm(
                                            PathfindingAlgorithm[
                                                key as keyof typeof PathfindingAlgorithm
                                            ]
                                        );
                                        setDropdown(null);
                                    }}
                                >
                                    {
                                        PathfindingAlgorithm[
                                            key as keyof typeof PathfindingAlgorithm
                                        ]
                                    }
                                </button>
                            )
                        )}
                    </div>
                </div>
                <div className="dropdown">
                    <div className="dropdown-caption">
                        Grid Size:
                        <RxQuestionMark />
                    </div>
                    <button
                        className="dropdown-btn"
                        ref={gridRef}
                        onClick={() =>
                            setDropdown(
                                dropdown === "gridSize" ? null : "gridSize"
                            )
                        }
                    >
                        {gridSize}
                        <SlArrowDown />
                    </button>

                    <div
                        className="dropdown-content"
                        style={{
                            display: dropdown === "gridSize" ? "" : "none",
                        }}
                    >
                        {Object.keys(GridSize).map((key: string) => (
                            <button
                                className="dropdown-item"
                                key={key}
                                onClick={() => {
                                    setGridSize(
                                        GridSize[key as keyof typeof GridSize]
                                    );
                                    setDropdown(null);
                                }}
                            >
                                {GridSize[key as keyof typeof GridSize]}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="dropdown">
                    <div className="dropdown-caption">
                        Speed:
                        <RxQuestionMark />
                    </div>
                    <button
                        className="dropdown-btn"
                        ref={speedRef}
                        onClick={() =>
                            setDropdown(dropdown === "speed" ? null : "speed")
                        }
                    >
                        {speed}
                        <SlArrowDown />
                    </button>
                    <div
                        className="dropdown-content"
                        style={{
                            display: dropdown === "speed" ? "" : "none",
                        }}
                    >
                        {Object.keys(Speed).map((key: string) => (
                            <button
                                className="dropdown-item"
                                key={key}
                                onClick={() => {
                                    setSpeed(Speed[key as keyof typeof Speed]);
                                    setDropdown(null);
                                }}
                            >
                                {Speed[key as keyof typeof Speed]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {/* <div className="start-stop">
                <button
                    className="start-stop-btn"
                    onClick={() => {
                        if (running === RunningState.READY) {
                            setRunning(RunningState.RUNNING);
                        } else if (running === RunningState.FINISHED) {
                            setRunning(RunningState.READY);
                        } else {
                            setRunning(RunningState.FINISHED);
                        }
                    }}
                >
                    {running === RunningState.FINISHED ? (
                        <FaRotateLeft />
                    ) : running === RunningState.READY ? (
                        <FaPlay />
                    ) : (
                        <FaStop />
                    )}
                </button>
            </div> */}
        </div>
    );
};

export default Menu;
