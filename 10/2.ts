declare type RawPipeMap = Pipe[][];
declare type Node = [number, number];
declare type Direction = [-1 | 0 | 1, -1 | 0 | 1];
declare type Pipe = "|" | "-" | "L" | "J" | "7" | "F" | "." | "S";

const UP = [0, -1] as Direction;
const DOWN = [0, 1] as Direction;
const LEFT = [-1, 0] as Direction;
const RIGHT = [1, 0] as Direction;
const DIRECTIONS: Direction[] = [LEFT, RIGHT, UP, DOWN];

export default async function run(input: string) {
  return PipeMap.fromString(input).enclosedTileCount;
}

class PipeMap {
  private pipes: Map2D<Pipe>;
  private loopMap: Map2D<Pipe | "I" | "O">;

  constructor(pipes: RawPipeMap) {
    this.pipes = new Map2D(pipes);
    const root = this.findStart();
    if (root === undefined) throw new Error("Start not found!");
    const loop = this.followPath(root);
    if (loop === undefined) throw new Error("Loop not found!");
    this.loopMap = Map2D.withFill(this.pipes.width, this.pipes.height, "." as Pipe);
    for (const node of loop) this.loopMap.set(node, this.pipes.get(node)!);

    // fill all dots between two lines
    for (let y = 0; y < this.loopMap.height; y++) {
      let wallStart: undefined | Pipe;
      let inside = false;
      for (let x = 0; x < this.loopMap.width; x++) {
        const node = [x, y] as Node;
        const pipe = this.loopMap.get(node)!;
        switch (pipe) {
          case "L":
          case "F":
            wallStart = pipe;
            break;
          case "|":
            inside = !inside;
            break;
          case "J":
            if (wallStart === "F") inside = !inside;
            break;
          case "7":
            if (wallStart === "L") inside = !inside;
            break;
          case ".":
            if (inside) this.loopMap.set(node, "I");
            break;
        }
      }
    }
  }

  static fromString(input: string) {
    return new PipeMap(input.split("\n").map((line) => line.split("") as Pipe[]));
  }

  get enclosedTileCount() {
    let count = 0;
    this.loopMap.forEach((_, v) => v === "I" && count++);
    return count;
  }

  private findStart() {
    for (let x = 0; x < this.pipes.width; x++) {
      for (let y = 0; y < this.pipes.height; y++) {
        const node = [x, y] as Node;
        if (this.pipes.get(node) === "S") return node;
      }
    }
  }

  private followPath(start: Node) {
    const firstNeighbor = this.findNodeConnectedToMe(start);
    if (firstNeighbor === undefined) throw new Error("No neighbor found from start!");

    const path = [start];
    let node = firstNeighbor;
    const leftMost = {
      direction: [0, 0] as Direction,
      location: [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY] as Node,
    };
    while (!nodesEqual(node, start)) {
      const prevNode = path[path.length - 1];
      path.push(node);

      // save highest node in path and its direction
      if (node[0] <= leftMost.location[0]) {
        leftMost.location = node;
        leftMost.direction = getDirection(prevNode, node);
      }

      // next node
      node = this.getNeightbors(node).filter((n) => !nodesEqual(n, prevNode))[0];
    }

    // check if direction is clockwise (if loop is going down on the left side)
    if (leftMost.direction[1] > 0) return path.reverse();
    return path;
  }

  private findNodeConnectedToMe(me: Node) {
    const directionMapping = [
      [LEFT, ["-", "F", "L"]],
      [UP, ["|", "F", "7"]],
      [RIGHT, ["-", "7", "J"]],
      [DOWN, ["|", "L", "J"]],
    ] as [Direction, Pipe[]][];
    for (const [direction, allowedPipes] of directionMapping) {
      const neighborNode = applyDirection(me, direction);
      const neighbor = this.pipes.get(neighborNode);
      if (neighbor !== undefined && allowedPipes.includes(neighbor)) return neighborNode;
    }
  }

  private getNeightbors(node: Node) {
    const neighbors = [] as Node[];

    switch (this.pipes.get(node)!) {
      case "-":
        return [applyDirection(node, LEFT), applyDirection(node, RIGHT)];
      case "7":
        return [applyDirection(node, LEFT), applyDirection(node, DOWN)];
      case "F":
        return [applyDirection(node, RIGHT), applyDirection(node, DOWN)];
      case "J":
        return [applyDirection(node, LEFT), applyDirection(node, UP)];
      case "L":
        return [applyDirection(node, UP), applyDirection(node, RIGHT)];
      case "|":
        return [applyDirection(node, UP), applyDirection(node, DOWN)];
    }
    return neighbors;
  }
}

class Map2D<T> {
  get width() {
    return this.nodes[0].length;
  }

  get height() {
    return this.nodes.length;
  }

  constructor(private nodes: T[][]) {}

  static withFill<T>(width: number, height: number, value: T) {
    const nodes = new Array(height) as T[][];
    for (let y = 0; y < height; y++) {
      nodes[y] = new Array(width).fill(value);
    }
    return new Map2D(nodes);
  }

  get(node: Node) {
    const [x, y] = node;
    if (!this.isValid(x, y)) return;
    return this.nodes[y][x];
  }

  set(node: Node, value: T) {
    const [x, y] = node;
    if (!this.isValid(x, y)) return false;
    this.nodes[y][x] = value;
    return true;
  }

  isValid(x: number, y: number) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  floodFill(start: Node, searchVal: T, newVal: T) {
    const queue = [start];
    while (queue.length !== 0) {
      const node = queue.shift()!;
      if (this.get(node) !== searchVal) continue;
      this.set(node, newVal);
      for (const neighborNode of this.getNeighbors(node)) {
        queue.push(neighborNode);
      }
    }
  }

  getNeighbors(node: Node) {
    return DIRECTIONS.map((d) => applyDirection(node, d));
  }

  forEach(fn: (node: Node, value: T) => void) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        fn([x, y], this.nodes[y][x]);
      }
    }
  }

  some(fn: (node: Node, value: T) => boolean) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const hit = fn([x, y], this.nodes[y][x]);
        if (hit) return true;
      }
    }
    return false;
  }

  isEdgeNode(node: Node) {
    const [x, y] = node;
    return x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1;
  }

  print(spacing: number) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let value = this.nodes[y][x];
        let valueStr = value + "";
        if (typeof value === "number" && isNaN(value)) valueStr = ".";
        process.stdout.write(padSpaces(valueStr, spacing));
      }
      console.log();
    }
  }
}

function nodesEqual(a?: Node, b?: Node) {
  if (a === undefined || b === undefined) return false;
  return a[0] === b[0] && a[1] === b[1];
}

function padSpaces(n: any, length: number) {
  const nStr = n.toString();
  return " ".repeat(length - nStr.length) + nStr;
}

function getDirection(first: Node, second: Node) {
  return [second[0] - first[0], second[1] - first[1]] as Direction;
}

function applyDirection(node: Node, direction: Direction) {
  return [node[0] + direction[0], node[1] + direction[1]] as Node;
}
