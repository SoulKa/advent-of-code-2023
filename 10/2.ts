import Direction from "./direction";
import Node from "./node";

declare type RawPipeMap = Pipe[][];
declare type Pipe = "|" | "-" | "L" | "J" | "7" | "F" | "." | "S";

const DIRECTIONS_TO_PIPE_MAPPING = [
  [Direction.LEFT, Direction.UP, "J"],
  [Direction.LEFT, Direction.RIGHT, "-"],
  [Direction.LEFT, Direction.DOWN, "7"],
  [Direction.UP, Direction.RIGHT, "L"],
  [Direction.UP, Direction.DOWN, "|"],
  [Direction.RIGHT, Direction.DOWN, "F"],
] as [Direction, Direction, Pipe][];

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
    const { pipe: rootSymbol, firstNeighbor } = this.resolveStartPipe(root);
    this.pipes.set(root, rootSymbol);

    const loop = this.followPath(root, firstNeighbor);
    if (loop === undefined) throw new Error("Loop not found!");
    this.loopMap = Map2D.withFill(this.pipes.width, this.pipes.height, "." as Pipe);
    for (const node of loop) this.loopMap.set(node, this.pipes.get(node)!);

    // fill all inside dots
    for (let y = 0; y < this.loopMap.height; y++) {
      let wallStart: undefined | Pipe;
      let inside = false;
      for (let x = 0; x < this.loopMap.width; x++) {
        const node = new Node([x, y]);
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
        const node = new Node([x, y]);
        if (this.pipes.get(node) === "S") return node;
      }
    }
  }

  private resolveStartPipe(start: Node) {
    const neighborsOfRoot = this.findNodesConnectedToMe(start);
    if (neighborsOfRoot.length !== 2)
      throw new Error(`Expected exactly two pipes connected to the start, but got ${neighborsOfRoot.length}`);
    const [first, second] = neighborsOfRoot;
    const firstDirection = Direction.fromNodes(start, first);
    const secondDirection = Direction.fromNodes(start, second);

    const pipe = DIRECTIONS_TO_PIPE_MAPPING.find(
      ([a, b]) => firstDirection.equalTo(a) && secondDirection.equalTo(b)
    )?.[2];
    if (pipe === undefined) throw new Error("Could not resolve pipe value of S from neighbors: " + neighborsOfRoot);

    return {
      pipe,
      firstNeighbor: first,
    };
  }

  private followPath(start: Node, firstNeighbor: Node) {
    const path = [start] as Node[];
    let node = firstNeighbor;
    while (!nodesEqual(node, start)) {
      path.push(node);
      node = this.getNeightbors(node).filter((n) => !nodesEqual(n, path[path.length - 2]))[0];
    }
    return path;
  }

  private findNodesConnectedToMe(me: Node) {
    const neighbors = [] as Node[];
    const directionMapping = [
      [Direction.LEFT, ["-", "F", "L"]],
      [Direction.UP, ["|", "F", "7"]],
      [Direction.RIGHT, ["-", "7", "J"]],
      [Direction.DOWN, ["|", "L", "J"]],
    ] as [Direction, Pipe[]][];
    for (const [direction, allowedPipes] of directionMapping) {
      const neighborNode = applyDirection(me, direction);
      const neighbor = this.pipes.get(neighborNode);
      if (neighbor !== undefined && allowedPipes.includes(neighbor)) neighbors.push(neighborNode);
    }
    return neighbors;
  }

  private getNeightbors(node: Node) {
    const neighbors = [] as Node[];
    switch (this.pipes.get(node)!) {
      case "-":
        return [applyDirection(node, Direction.LEFT), applyDirection(node, Direction.RIGHT)];
      case "7":
        return [applyDirection(node, Direction.LEFT), applyDirection(node, Direction.DOWN)];
      case "F":
        return [applyDirection(node, Direction.RIGHT), applyDirection(node, Direction.DOWN)];
      case "J":
        return [applyDirection(node, Direction.LEFT), applyDirection(node, Direction.UP)];
      case "L":
        return [applyDirection(node, Direction.UP), applyDirection(node, Direction.RIGHT)];
      case "|":
        return [applyDirection(node, Direction.UP), applyDirection(node, Direction.DOWN)];
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
    const { x, y } = node;
    if (!this.isValid(x, y)) return;
    return this.nodes[y][x];
  }

  set(node: Node, value: T) {
    const { x, y } = node;
    if (!this.isValid(x, y)) return false;
    this.nodes[y][x] = value;
    return true;
  }

  isValid(x: number, y: number) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  getNeighbors(node: Node) {
    return Direction.DIRECTIONS.map((d) => applyDirection(node, d));
  }

  forEach(fn: (node: Node, value: T) => void) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        fn(new Node([x, y]), this.nodes[y][x]);
      }
    }
  }

  some(fn: (node: Node, value: T) => boolean) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const hit = fn(new Node([x, y]), this.nodes[y][x]);
        if (hit) return true;
      }
    }
    return false;
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
  return a.x === b.x && a.y === b.y;
}

function padSpaces(n: any, length: number) {
  const nStr = n.toString();
  return " ".repeat(length - nStr.length) + nStr;
}

function applyDirection(node: Node, direction: Direction) {
  return new Node([node.x + direction.x, node.y + direction.y]);
}
