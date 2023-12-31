import {
    COLORS,
    GridSize,
    MazeGen,
    PathfindingAlgorithm,
    Speed,
} from "../constants";

import * as p5 from "p5";

window.p5 = p5;

await import("p5/lib/addons/p5.sound");

function squareSketch(p5) {
    let wave;
    // state
    let started = false;
    let volume = 0;
    let w;
    let h;
    let gridSize = GridSize.Medium;
    let squareSize = 45;
    let grid;
    let rows;
    let cols;
    let mazeGenerated;
    const setMazeGenerated = (value) => {
        mazeGenerated = value;
        let event = new CustomEvent("canvas", {
            detail: {
                mazeGenerated: value,
            },
        });
        window.dispatchEvent(event);
    };
    let pathGenerated;
    let pathVisible;

    // generation
    let generation;
    let stack;
    let current;
    let sets;

    // path finding
    let algorithm;
    let queue;
    let path;
    let start;
    let end;

    const initMazeGeneration = () => {
        cols = Math.floor(w / squareSize);
        rows = Math.floor(h / squareSize);
        grid = [];
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                const cell = new Cell(i, j);
                grid.push(cell);
            }
        }
        stack = [];
        sets = new Set();
        current = undefined;

        if (
            generation === MazeGen.RecursiveBacktracker ||
            generation === MazeGen.CyclicRecursiveBacktracker
        ) {
            let startInd = Math.floor(Math.random() * grid.length);
            current = grid[startInd];
            stack.push(current);
        } else if (generation === MazeGen.RecursiveDivision) {
            for (let i = 0; i < grid.length; i++) {
                grid[i].walls = {
                    top: i < cols,
                    right: (i + 1) % cols === 0,
                    bottom: i >= cols * (rows - 1),
                    left: i % cols === 0,
                };
                grid[i].generated = true;
            }
            stack.push({
                x: 0,
                y: 0,
                width: cols,
                height: rows,
            });
        } else if (generation === MazeGen.RandomWalls) {
            for (let i = 0; i < grid.length; i++) {
                grid[i].generated = true;
                stack.push(grid[grid.length - 1 - i]);
            }
        } else if (generation === MazeGen.RandomizedPrim) {
            let startInd = Math.floor(Math.random() * grid.length);
            current = grid[startInd];
            current.generated = true;
            current.getNeighbors().forEach((neighbor) => {
                stack.push([neighbor, current]);
            });
        } else if (generation === MazeGen.RandomizedKruskal) {
            sets = new Set(grid.map((cell) => new Set([cell])));
            for (let i = 0; i < grid.length; i++) {
                if (i % cols !== cols - 1) {
                    stack.push([grid[i], grid[i + 1]]);
                }
                if (i < grid.length - cols) {
                    stack.push([grid[i], grid[i + cols]]);
                }
            }
        } else if (generation === MazeGen.None) {
            for (let i = 0; i < grid.length; i++) {
                grid[i].generated = true;
                if (i % cols !== cols - 1) {
                    removeWalls(grid[i], grid[i + 1]);
                }
                if (i < grid.length - cols) {
                    removeWalls(grid[i], grid[i + cols]);
                }
            }
        } else if (generation === MazeGen.SimpleWall) {
            for (let i = 0; i < grid.length; i++) {
                grid[i].generated = true;
                if (i % cols !== cols - 1) {
                    removeWalls(grid[i], grid[i + 1]);
                }
                if (i < grid.length - cols) {
                    removeWalls(grid[i], grid[i + cols]);
                }
            }
            for (
                let i = Math.floor(cols * 0.1);
                i < Math.floor(cols * 0.9);
                i++
            ) {
                addWalls(
                    grid[index(i, Math.floor(rows / 2))],
                    grid[index(i, Math.floor(rows / 2) + 1)]
                );
            }
        }
        setMazeGenerated(false);
        pathGenerated = false;
        pathVisible = false;
    };

    const initPathFinding = () => {
        if (current) {
            current.highlighted = false;
            current.show(p5);
            current = undefined;
        }
        let hasStart = false;
        let hasEnd = false;
        for (let i = 0; i < grid.length; i++) {
            grid[i].visited = false;
            grid[i].distance = -1;
            grid[i].parent = undefined;
            if (grid[i].isStart) {
                hasStart = true;
            }
            if (grid[i].isEnd) {
                hasEnd = true;
            }
            grid[i].show(p5);
        }
        if (!hasStart || !hasEnd) {
            let startInd = Math.floor(Math.random() * grid.length);
            start = grid[startInd];
            let endInd = Math.floor(Math.random() * grid.length);
            if (endInd === startInd) {
                endInd = (endInd + 1) % grid.length;
            }
            end = grid[endInd];

            start.isStart = true;
            end.isEnd = true;
        }
        start.visited = true;
        start.distance = 0;
        start.G = 0;
        start.H = 0;
        queue = [start];
        path = [];

        setMazeGenerated(true);
        pathGenerated = false;
        pathVisible = false;
    };

    p5.setup = () => {
        h = Math.max(
            p5.windowHeight -
                document.getElementsByClassName("App-header")[0].offsetHeight -
                125,
            300
        );
        w = p5.windowWidth - 120;
        p5.createCanvas(w, h);

        wave = new window.p5.Oscillator();
        wave.setType("sine");

        window.addEventListener("restart", (event) => {
            started = true;
            if (event.detail.mazeGen) {
                initMazeGeneration();
            } else if (event.detail.pathfinding && mazeGenerated) {
                start.isStart = false;
                end.isEnd = false;
                initPathFinding();
            }
        });
    };

    p5.updateWithProps = (props) => {
        if (props.speed) {
            switch (props.speed) {
                case Speed.Slow:
                    p5.frameRate(2);
                    break;
                case Speed.Medium:
                    p5.frameRate(10);
                    break;
                case Speed.Fast:
                    p5.frameRate(60);
                    break;
                case Speed.Pause:
                    wave.stop();
                    p5.frameRate(0);
                    break;
                default:
                    break;
            }
        }
        if (props.volume !== undefined) {
            volume = props.volume;
        }
        if (props.gridSize && props.gridSize !== gridSize) {
            switch (props.gridSize) {
                case GridSize.Small:
                    squareSize = 90;
                    break;
                case GridSize.Medium:
                    squareSize = 45;
                    break;
                case GridSize.Large:
                    squareSize = 30;
                    break;
                default:
                    break;
            }
            gridSize = props.gridSize;
            p5.clear();
            initMazeGeneration();
        }
        if (props.mazeGen && props.mazeGen !== generation) {
            generation = props.mazeGen;
            initMazeGeneration();
        }
        if (props.algorithm && props.algorithm !== algorithm) {
            algorithm = props.algorithm;
            if (mazeGenerated) {
                initPathFinding();
            }
        }
    };

    p5.draw = () => {
        if (!started) {
            return;
        }
        if (current && !pathVisible) {
            if (!wave.started) {
                wave.start();
            }
            wave.freq(
                p5.map(current.y * cols + current.x, 0, grid.length, 100, 1000)
            );
            wave.amp(p5.map(volume, 0, 3, 0, 0.4, true));
        }

        if (!mazeGenerated) {
            grid.forEach((cell) => {
                cell.highlighted = cell === current;
                cell.show(p5);
            });
            if (
                generation === MazeGen.RecursiveBacktracker ||
                generation === MazeGen.CyclicRecursiveBacktracker
            ) {
                current.generated = true;
                let neighbors = current.getNeighbors().filter((neighbor) => {
                    return !neighbor.generated;
                });
                let r = Math.floor(Math.random() * neighbors.length);
                let next = neighbors[r];
                if (next) {
                    next.generated = true;
                    stack.push(current);
                    removeWalls(current, next);
                    current = next;
                } else if (stack.length > 0) {
                    if (
                        generation === MazeGen.CyclicRecursiveBacktracker &&
                        Math.random() < 0.5
                    ) {
                        let d = Math.random() < 0.5 ? -1 : 1;
                        let x = Math.random() < 0.5;
                        removeWalls(
                            current,
                            grid[
                                index(
                                    current.x + (x ? d : 0),
                                    current.y + (x ? 0 : d)
                                )
                            ]
                        );
                    }
                    current = stack.pop();
                } else {
                    initPathFinding();
                }
            } else if (generation === MazeGen.RecursiveDivision) {
                if (stack.length > 0) {
                    let params = undefined;
                    do {
                        params = stack.pop();
                    } while (
                        stack.length > 0 &&
                        params &&
                        (params.width <= 1 || params.height <= 1)
                    );
                    if (!params) {
                        return;
                    }
                    if (params.width > 1 && params.height > 1) {
                        let x = params.x;
                        let y = params.y;
                        current = grid[index(x, y)];
                        let width = params.width;
                        let height = params.height;
                        let horizontal =
                            width < height
                                ? true
                                : width > height
                                  ? false
                                  : Math.random() < 0.5;

                        let wx =
                            x +
                            (horizontal
                                ? 0
                                : Math.floor(Math.random() * (width - 1)));
                        let wy =
                            y +
                            (horizontal
                                ? Math.floor(Math.random() * (height - 1))
                                : 0);

                        let px =
                            wx +
                            (horizontal
                                ? Math.floor(Math.random() * width)
                                : 0);
                        let py =
                            wy +
                            (horizontal
                                ? 0
                                : Math.floor(Math.random() * height));

                        let dx = horizontal ? 1 : 0;
                        let dy = horizontal ? 0 : 1;
                        let length = horizontal ? width : height;

                        for (let i = 0; i < length; i++) {
                            if (wx !== px || wy !== py) {
                                if (horizontal) {
                                    addWalls(
                                        grid[index(wx, wy)],
                                        grid[index(wx, wy + 1)]
                                    );
                                } else {
                                    addWalls(
                                        grid[index(wx, wy)],
                                        grid[index(wx + 1, wy)]
                                    );
                                }
                            }
                            wx += dx;
                            wy += dy;
                        }
                        stack.push({
                            x: x,
                            y: y,
                            width: horizontal ? width : wx - x + 1,
                            height: horizontal ? wy - y + 1 : height,
                        });
                        stack.push({
                            x: horizontal ? x : wx + 1,
                            y: horizontal ? wy + 1 : y,
                            width: horizontal ? width : x + width - wx - 1,
                            height: horizontal ? y + height - wy - 1 : height,
                        });
                    }
                } else {
                    initPathFinding();
                }
            } else if (generation === MazeGen.RandomWalls) {
                for (let i = 0; i < cols; i++) {
                    if (stack.length > 0) {
                        current = stack.pop();
                        let neighbors = current.getNeighbors();
                        if (neighbors.length > 0) {
                            for (let j = 0; j < neighbors.length; j++) {
                                if (Math.random() < 0.4) {
                                    removeWalls(current, neighbors[j]);
                                }
                            }
                        }
                    } else {
                        initPathFinding();
                    }
                }
            } else if (generation === MazeGen.RandomizedPrim) {
                if (stack.length > 0) {
                    let next = stack[Math.floor(Math.random() * stack.length)];
                    next[0].generated = true;
                    stack = stack.filter((cell) => {
                        return cell !== next;
                    });
                    if (next) {
                        current = next[0];
                        let a = next[0];
                        let b = next[1];

                        removeWalls(a, b);
                        a.getNeighbors().forEach((neighbor) => {
                            if (
                                !neighbor.generated &&
                                !stack.some((cell) => cell[0] === neighbor)
                            ) {
                                stack.push([neighbor, a]);
                            }
                        });
                    }
                } else {
                    initPathFinding();
                }
            } else if (generation === MazeGen.RandomizedKruskal) {
                if (stack.length > 1) {
                    let next = stack[Math.floor(Math.random() * stack.length)];
                    stack = stack.filter((cell) => {
                        return cell !== next;
                    });
                    if (next) {
                        current = next[0];
                        let a = next[0];
                        let b = next[1];
                        let aSet;
                        let bSet;
                        sets.forEach((set) => {
                            if (set.has(a)) {
                                aSet = set;
                            }
                            if (set.has(b)) {
                                bSet = set;
                            }
                        });
                        if (aSet !== bSet) {
                            removeWalls(a, b);
                            a.generated = true;
                            b.generated = true;
                            sets.delete(aSet);
                            sets.delete(bSet);
                            sets.add(new Set([...aSet, ...bSet]));
                        }
                    }
                } else {
                    initPathFinding();
                }
            } else if (
                generation === MazeGen.None ||
                generation === MazeGen.SimpleWall
            ) {
                initPathFinding();
            }
        } else if (!pathGenerated) {
            p5.noStroke();
            p5.fill(COLORS.malachite);
            p5.circle(
                start.x * squareSize + squareSize / 2,
                start.y * squareSize + squareSize / 2,
                squareSize * 0.6
            );

            p5.fill(COLORS.celestialBlue);
            p5.circle(
                end.x * squareSize + squareSize / 2,
                end.y * squareSize + squareSize / 2,
                squareSize * 0.6
            );
            if (algorithm === PathfindingAlgorithm.BreadthFirstSearch) {
                if (queue.length > 0) {
                    current = queue.shift();
                    let neighbors = current.getAdjacent().filter((neighbor) => {
                        return !neighbor.visited;
                    });
                    neighbors.forEach((neighbor) => {
                        if (!neighbor.visited) {
                            neighbor.visited = true;
                            neighbor.parent = current;
                            neighbor.distance = current.distance + 1;
                            queue.push(neighbor);
                            p5.stroke(COLORS.malachiteDisabled);
                            p5.strokeWeight(squareSize * 0.15);
                            p5.line(
                                (current.x + 0.5) * squareSize,
                                (current.y + 0.5) * squareSize,
                                (neighbor.x + 0.5) * squareSize,
                                (neighbor.y + 0.5) * squareSize
                            );
                            if (neighbor === end) {
                                let temp = neighbor;
                                path.push(temp);
                                while (temp.parent) {
                                    path.push(temp.parent);
                                    temp = temp.parent;
                                }
                                path.reverse();
                                pathGenerated = true;
                                return;
                            }
                        }
                    });
                }
            } else if (algorithm === PathfindingAlgorithm.DepthFirstSearch) {
                if (queue.length > 0) {
                    current = queue.pop();
                    current.visited = true;
                    if (current.parent) {
                        p5.stroke(COLORS.malachiteDisabled);
                        p5.strokeWeight(squareSize * 0.15);
                        p5.line(
                            (current.x + 0.5) * squareSize,
                            (current.y + 0.5) * squareSize,
                            (current.parent.x + 0.5) * squareSize,
                            (current.parent.y + 0.5) * squareSize
                        );
                    }
                    if (current === end) {
                        let temp = current;
                        path.push(temp);
                        while (temp.parent) {
                            path.push(temp.parent);
                            temp = temp.parent;
                        }
                        path.reverse();
                        pathGenerated = true;
                        return;
                    }

                    let neighbors = current.getAdjacent().filter((neighbor) => {
                        return !neighbor.visited;
                    });
                    neighbors.forEach((neighbor) => {
                        if (!neighbor.visited) {
                            neighbor.parent = current;
                            neighbor.distance = current.distance + 1;
                            queue.push(neighbor);
                        }
                    });
                }
            } else if (
                algorithm === PathfindingAlgorithm.GreedyBestFirstSearch
            ) {
                if (queue.length > 0) {
                    current = queue.shift();
                    if (current.parent) {
                        p5.stroke(COLORS.malachiteDisabled);
                        p5.strokeWeight(squareSize * 0.15);
                        p5.line(
                            (current.x + 0.5) * squareSize,
                            (current.y + 0.5) * squareSize,
                            (current.parent.x + 0.5) * squareSize,
                            (current.parent.y + 0.5) * squareSize
                        );
                    }
                    let neighbors = current.getAdjacent().filter((neighbor) => {
                        return !neighbor.visited;
                    });
                    neighbors.forEach((neighbor) => {
                        if (!neighbor.visited) {
                            neighbor.visited = true;
                            neighbor.parent = current;
                            neighbor.distance = Math.sqrt(
                                Math.pow(neighbor.x - end.x, 2) +
                                    Math.pow(neighbor.y - end.y, 2)
                            );
                            queue.push(neighbor);
                            if (neighbor === end) {
                                let temp = neighbor;
                                path.push(temp);
                                while (temp.parent) {
                                    path.push(temp.parent);
                                    temp = temp.parent;
                                }
                                path.reverse();
                                pathGenerated = true;
                                return;
                            }
                        }
                    });
                    queue.sort((a, b) => {
                        return a.distance - b.distance;
                    });
                }
            } else if (algorithm === PathfindingAlgorithm.AStar) {
                if (queue.length > 0) {
                    current = queue.shift();
                    if (current.parent) {
                        p5.stroke(COLORS.malachiteDisabled);
                        p5.strokeWeight(squareSize * 0.15);
                        p5.line(
                            (current.x + 0.5) * squareSize,
                            (current.y + 0.5) * squareSize,
                            (current.parent.x + 0.5) * squareSize,
                            (current.parent.y + 0.5) * squareSize
                        );
                    }
                    let neighbors = current.getAdjacent().filter((neighbor) => {
                        return !neighbor.visited;
                    });
                    neighbors.forEach((neighbor) => {
                        if (!neighbor.visited) {
                            neighbor.visited = true;
                            neighbor.parent = current;
                            neighbor.G = current.G + 1;
                            neighbor.H = Math.sqrt(
                                Math.pow(neighbor.x - end.x, 2) +
                                    Math.pow(neighbor.y - end.y, 2)
                            );
                            queue.push(neighbor);
                            if (neighbor === end) {
                                let temp = neighbor;
                                path.push(temp);
                                while (temp.parent) {
                                    path.push(temp.parent);
                                    temp = temp.parent;
                                }
                                path.reverse();
                                pathGenerated = true;
                                return;
                            }
                        }
                    });
                    queue.sort((a, b) => {
                        return a.G + a.H - b.G - b.H;
                    });
                }
            }
        } else if (!pathVisible) {
            if (path.length > 1) {
                current = path.pop();
                let parent = current.parent;
                p5.stroke(COLORS.celestialBlueDark);
                p5.strokeWeight(squareSize * 0.3);
                p5.line(
                    (parent.x + 0.5) * squareSize,
                    (parent.y + 0.5) * squareSize,
                    (current.x + 0.5) * squareSize,
                    (current.y + 0.5) * squareSize
                );

                p5.noStroke();
                p5.fill(COLORS.malachite);
                p5.circle(
                    start.x * squareSize + squareSize / 2,
                    start.y * squareSize + squareSize / 2,
                    squareSize * 0.6
                );

                p5.fill(COLORS.celestialBlue);
                p5.circle(
                    end.x * squareSize + squareSize / 2,
                    end.y * squareSize + squareSize / 2,
                    squareSize * 0.6
                );
            } else {
                pathVisible = true;
                wave.stop();
            }
        }
    };

    class Cell {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.generated = false;
            this.highlighted = false;
            this.isStart = false;
            this.isEnd = false;
            this.visited = false;
            this.distance = -1;
            this.walls = {
                top: true,
                right: true,
                bottom: true,
                left: true,
            };
            this.parent = undefined;
        }

        show(p5) {
            const x = this.x * squareSize;
            const y = this.y * squareSize;

            p5.noStroke();

            p5.fill(
                this.highlighted
                    ? COLORS.malachite
                    : this.generated
                      ? 0
                      : COLORS.gunmetalLight
            );
            p5.rect(x, y, squareSize, squareSize);

            p5.stroke(COLORS.gunmetalLight);
            p5.strokeWeight(squareSize * 0.05);
            if (this.walls.top) {
                p5.line(x, y, x + squareSize, y);
            }
            if (this.walls.right) {
                p5.line(x + squareSize, y, x + squareSize, y + squareSize);
            }
            if (this.walls.bottom) {
                p5.line(x + squareSize, y + squareSize, x, y + squareSize);
            }
            if (this.walls.left) {
                p5.line(x, y + squareSize, x, y);
            }
        }

        getAdjacent() {
            const neighbors = [];

            const top = grid[index(this.x, this.y - 1)];
            const right = grid[index(this.x + 1, this.y)];
            const bottom = grid[index(this.x, this.y + 1)];
            const left = grid[index(this.x - 1, this.y)];

            if (top && !this.walls.top) {
                neighbors.push(top);
            }
            if (right && !this.walls.right) {
                neighbors.push(right);
            }
            if (bottom && !this.walls.bottom) {
                neighbors.push(bottom);
            }
            if (left && !this.walls.left) {
                neighbors.push(left);
            }

            // const topRight = grid[index(this.x + 1, this.y - 1)];
            // const bottomRight = grid[index(this.x + 1, this.y + 1)];
            // const bottomLeft = grid[index(this.x - 1, this.y + 1)];
            // const topLeft = grid[index(this.x - 1, this.y - 1)];

            // if (
            //     topRight &&
            //     !this.walls.top &&
            //     !this.walls.right &&
            //     !topRight.walls.left &&
            //     !topRight.walls.bottom
            // ) {
            //     neighbors.push(topRight);
            // }
            // if (
            //     bottomRight &&
            //     !this.walls.right &&
            //     !this.walls.bottom &&
            //     !bottomRight.walls.top &&
            //     !bottomRight.walls.left
            // ) {
            //     neighbors.push(bottomRight);
            // }
            // if (
            //     bottomLeft &&
            //     !this.walls.bottom &&
            //     !this.walls.left &&
            //     !bottomLeft.walls.top &&
            //     !bottomLeft.walls.right
            // ) {
            //     neighbors.push(bottomLeft);
            // }
            // if (
            //     topLeft &&
            //     !this.walls.left &&
            //     !this.walls.top &&
            //     !topLeft.walls.right &&
            //     !topLeft.walls.bottom
            // ) {
            //     neighbors.push(topLeft);
            // }

            return neighbors;
        }

        getNeighbors() {
            const neighbors = [];

            const top = grid[index(this.x, this.y - 1)];
            const right = grid[index(this.x + 1, this.y)];
            const bottom = grid[index(this.x, this.y + 1)];
            const left = grid[index(this.x - 1, this.y)];

            if (top) {
                neighbors.push(top);
            }
            if (right) {
                neighbors.push(right);
            }
            if (bottom) {
                neighbors.push(bottom);
            }
            if (left) {
                neighbors.push(left);
            }

            return neighbors;
        }
    }

    function index(x, y) {
        if (x < 0 || y < 0 || x > cols - 1 || y > rows - 1) {
            return -1;
        }
        return x + y * cols;
    }

    function removeWalls(a, b) {
        if (!a || !b) {
            return;
        }
        const x = a.x - b.x;
        if (x === 1) {
            a.walls.left = false;
            b.walls.right = false;
        } else if (x === -1) {
            a.walls.right = false;
            b.walls.left = false;
        }
        const y = a.y - b.y;
        if (y === 1) {
            a.walls.top = false;
            b.walls.bottom = false;
        } else if (y === -1) {
            a.walls.bottom = false;
            b.walls.top = false;
        }
    }

    function addWalls(a, b) {
        if (!a || !b) {
            return;
        }
        const x = a.x - b.x;
        if (x === 1) {
            a.walls.left = true;
            b.walls.right = true;
        } else if (x === -1) {
            a.walls.right = true;
            b.walls.left = true;
        }
        const y = a.y - b.y;
        if (y === 1) {
            a.walls.top = true;
            b.walls.bottom = true;
        } else if (y === -1) {
            a.walls.bottom = true;
            b.walls.top = true;
        }
    }
}

export { squareSketch };
