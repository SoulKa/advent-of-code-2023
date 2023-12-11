declare type Node = [number, number];
declare type SpaceObject = "." | "#";

export default async function run(input: string) {
  const map = parseInput(input);

  // find galaxies
  const galaxies = [] as Galaxy[];
  map.forEach((node, value) => value === "#" && galaxies.push(new Galaxy(galaxies.length + 1, node)));

  // calculate distances
  const distances = [] as { galaxies: Set<number>; distance: number }[];
  galaxies.forEach((galaxyA, i) => {
    galaxies.slice(i + 1).forEach((galaxyB) => {
      distances.push({
        galaxies: new Set([galaxyA.id, galaxyB.id]),
        distance: galaxyA.distanceTo(galaxyB),
      });
    });
  });

  return distances.reduce((sum, d) => sum + d.distance, 0);
}

function parseInput(input: string) {
  const map = new Map2D(input.split("\n").map((line) => line.split("") as SpaceObject[]));
  const cols = map.cols;
  for (let x = 0; x < cols.length; x++) {
    const col = cols[x];
    if (!col.includes("#")) {
      cols.splice(x, 0, col);
      x++;
    }
  }

  const rows = colsToRows(cols);
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    if (!row.includes("#")) {
      rows.splice(y, 0, row);
      y++;
    }
  }

  return new Map2D(rows);
}

class Map2D<T> {
  get width() {
    return this.nodes[0].length;
  }

  get height() {
    return this.nodes.length;
  }

  get rows() {
    return this.nodes;
  }

  get cols() {
    return rowsToCols(this.rows);
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

  cloneRow(y: number) {
    this.nodes.splice(y, 0, this.nodes[y]);
  }

  cloneCol(x: number) {
    for (let y = 0; y < this.height; y++) {
      this.nodes[y].splice(x, 0, this.nodes[y][x]);
    }
  }

  isValid(x: number, y: number) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
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
        if (fn([x, y], this.nodes[y][x])) return true;
      }
    }
    return false;
  }

  isEdgeNode(node: Node) {
    const [x, y] = node;
    return x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1;
  }

  print(spacing: number) {
    this.forEach(([x, y]) => {
      const value = this.nodes[y][x];
      let valueStr = value + "";
      if (typeof value === "number" && isNaN(value)) valueStr = ".";
      process.stdout.write(padSpaces(valueStr, spacing));
      if (x === this.width - 1) process.stdout.write("\n");
    });
  }
}

class Galaxy {
  constructor(public readonly id: number, public readonly location: Node) {}

  distanceTo(other: Galaxy) {
    return Math.abs(this.location[0] - other.location[0]) + Math.abs(this.location[1] - other.location[1]);
  }
}

function padSpaces(n: any, length: number) {
  const nStr = n.toString();
  return " ".repeat(length - nStr.length) + nStr;
}

function rowsToCols<T>(rows: T[][]) {
  const cols = new Array(rows[0].length).fill([]) as T[][];
  cols.forEach((_, x) => (cols[x] = new Array(rows.length)));
  rows.forEach((row, y) => row.forEach((value, x) => (cols[x][y] = value)));
  return cols;
}

function colsToRows<T>(cols: T[][]) {
  return rowsToCols(cols);
}
