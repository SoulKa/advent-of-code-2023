declare type RawPipeMap = Pipe[][];
declare type Node = [number, number];
declare type Pipe = "|" | "-" | "L" | "J" | "7" | "F" | "." | "S";

export default async function run(input: string) {
  const map = PipeMap.fromString(input);
  return map.getMaxDistance();
}

class PipeMap {
  private visited: Map2D<boolean>;
  private distances: Map2D<number>;
  private pipes: Map2D<Pipe>;

  constructor(pipes: RawPipeMap) {
    this.pipes = new Map2D(pipes);
    this.visited = Map2D.withFill(this.pipes.width, this.pipes.height, false);
    this.distances = Map2D.withFill(this.pipes.width, this.pipes.height, NaN);
  }

  static fromString(input: string) {
    return new PipeMap(input.split("\n").map((line) => line.split("") as Pipe[]));
  }

  getMaxDistance() {
    const root = this.findStart();
    if (root === undefined) throw new Error("Start not found!");
    return this.bfs(root);
  }

  private findStart() {
    for (let x = 0; x < this.pipes.width; x++) {
      for (let y = 0; y < this.pipes.height; y++) {
        const node = [x, y] as Node;
        if (this.pipes.get(node) === "S") return node;
      }
    }
  }

  private dfs(node: Node, path: Node[]) {
    this.visited.set(node, true);
    path.push(node);
    for (const neighborNode of this.getNeightbors(node)) {
      if (this.visited.get(neighborNode)!) {
        if (this.isInPath(neighborNode, path)) {
          // loop found
        }
        continue;
      }
      this.dfs(neighborNode, path.slice());
    }
    path.pop();
  }

  private bfs(root: Node) {
    let maxDistance = 0;
    const queue = [] as { current: Node; previous: Node; distance: number }[];
    queue.push({ current: root, previous: root, distance: 0 });

    while (queue.length !== 0) {
      const { current, previous, distance } = queue.shift()!;
      this.distances.set(current, distance);

      // add neighbors
      for (const neighborNode of this.getNeightbors(current)) {
        const neighborDistance = this.distances.get(neighborNode)!;
        if (isNaN(neighborDistance)) {
          queue.push({ current: neighborNode, previous: current, distance: distance + 1 });
        } else if (!nodesEqual(neighborNode, previous)) {
          maxDistance = Math.max(maxDistance, distance, neighborDistance); // loop foudn
        }
      }
    }

    //this.distances.print(maxDistance.toString().length + 1);
    return maxDistance;
  }

  private isInPath(node: Node, path: Node[]) {
    return path.some((n) => n[0] === node[0] && n[1] === node[1]);
  }

  private getNeightbors(node: Node) {
    const neighbors = [] as Node[];
    const leftNode = [node[0] - 1, node[1]] as Node;
    const left = this.pipes.get(leftNode);
    const topNode = [node[0], node[1] - 1] as Node;
    const top = this.pipes.get(topNode);
    const rightNode = [node[0] + 1, node[1]] as Node;
    const right = this.pipes.get(rightNode);
    const bottomNode = [node[0], node[1] + 1] as Node;
    const bottom = this.pipes.get(bottomNode);
    if (left !== undefined && (["-", "F", "L", "S"] as Pipe[]).includes(left)) neighbors.push(leftNode);
    if (top !== undefined && (["|", "F", "7", "S"] as Pipe[]).includes(top)) neighbors.push(topNode);
    if (right !== undefined && (["-", "7", "J", "S"] as Pipe[]).includes(right)) neighbors.push(rightNode);
    if (bottom !== undefined && (["|", "L", "J", "S"] as Pipe[]).includes(bottom)) neighbors.push(bottomNode);
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

function nodesEqual(a: Node, b: Node) {
  return a[0] === b[0] && a[1] === b[1];
}

function padSpaces(n: any, length: number) {
  const nStr = n.toString();
  return " ".repeat(length - nStr.length) + nStr;
}
