import Node from "./node";

export default class Map2D<T> {
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
        if (fn(new Node([x, y]), this.nodes[y][x])) return true;
      }
    }
    return false;
  }

  isEdgeNode(node: Node) {
    const { x, y } = node;
    return x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1;
  }

  print(spacing: number) {
    this.forEach(({ x, y }) => {
      const value = this.nodes[y][x];
      let valueStr = value + "";
      if (typeof value === "number" && isNaN(value)) valueStr = ".";
      process.stdout.write(padSpaces(valueStr, spacing));
      if (x === this.width - 1) process.stdout.write("\n");
    });
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
