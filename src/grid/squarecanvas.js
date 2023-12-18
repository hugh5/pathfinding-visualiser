import { COLORS, MazeGen, Speed } from "../constants";

// Define the size of each square in the
export const squareSize = 45;

function squareSketch(p5) {
    // state
    let grid;
    let rows;
    let cols;
    let frameRate = 1;
    let mazeGenerated;
    let pathGenerated;
    let pathVisible;

    // generation
    let generation;
    let stack;
    let current;
    let sets;

    // path finding
    let queue;
    let path;
    let start;
    let end;

    const initMazeGeneration = () => {
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

        if (generation === MazeGen.RecursiveBacktracker) {
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
                neighbor.generated = true;
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
        }
        mazeGenerated = false;
        pathGenerated = false;
        pathVisible = false;
    };

    const initPathFinding = () => {
        if (current) {
            current.highlighted = false;
            current.show(p5);
            current = undefined;
        }

        let startInd = Math.floor(Math.random() * grid.length);
        start = grid[startInd];
        let endInd = Math.floor(Math.random() * grid.length);
        if (endInd === startInd) {
            endInd = (endInd + grid.length / 2) % grid.length;
        }
        end = grid[endInd];

        start.isStart = true;
        end.isEnd = true;
        start.visited = true;
        start.distance = 0;
        queue = [start];
        path = [];

        mazeGenerated = true;
        pathGenerated = false;
        pathVisible = false;
    };

    p5.setup = () => {
        p5.frameRate(frameRate);
        const h = Math.max(
            (p5.windowHeight -
                document.getElementsByClassName("App-header")[0].offsetHeight) *
                0.9,
            300
        );
        const w = p5.windowWidth * 0.9;
        cols = Math.floor(w / squareSize);
        rows = Math.floor(h / squareSize);
        p5.createCanvas(cols * squareSize, rows * squareSize);

        initMazeGeneration();
    };

    p5.updateWithProps = (props) => {
        if (props.speed) {
            switch (props.speed) {
                case Speed.Slow:
                    frameRate = 2;
                    break;
                case Speed.Medium:
                    frameRate = 10;
                    break;
                case Speed.Fast:
                    frameRate = 60;
                    break;
                default:
                    break;
            }
        }
        if (props.mazeGen && props.mazeGen !== generation) {
            generation = props.mazeGen;
            initMazeGeneration();
        }
    };

    p5.draw = () => {
        p5.frameRate(frameRate);
        if (!mazeGenerated) {
            grid.forEach((cell) => {
                cell.highlighted = cell === current;
                cell.show(p5);
            });
            if (generation === MazeGen.RecursiveBacktracker) {
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
                if (stack.length > 0) {
                    let current = stack.pop();
                    let neighbors = current.getNeighbors();
                    if (neighbors.length > 0) {
                        neighbors.forEach((neighbor) => {
                            if (Math.random() < 0.4) {
                                removeWalls(current, neighbor);
                            }
                        });
                    }
                } else {
                    initPathFinding();
                }
            } else if (generation === MazeGen.RandomizedPrim) {
                if (stack.length > 0) {
                    let next = stack[Math.floor(Math.random() * stack.length)];
                    stack = stack.filter((cell) => {
                        return cell !== next;
                    });
                    if (next) {
                        current = next[0];
                        let a = next[0];
                        let b = next[1];

                        removeWalls(a, b);
                        a.getNeighbors().forEach((neighbor) => {
                            if (!neighbor.generated) {
                                neighbor.generated = true;
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
            } else if (generation === MazeGen.None) {
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
            // bfs
            if (queue.length > 0) {
                let current = queue.shift();
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
        } else if (!pathVisible) {
            if (path.length > 1) {
                let next = path.pop();
                let parent = next.parent;
                p5.stroke(COLORS.celestialBlueDark);
                p5.strokeWeight(squareSize * 0.3);
                p5.line(
                    (parent.x + 0.5) * squareSize,
                    (parent.y + 0.5) * squareSize,
                    (next.x + 0.5) * squareSize,
                    (next.y + 0.5) * squareSize
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
