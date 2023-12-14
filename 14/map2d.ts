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
    const cols = new Array(this.rows[0].length).fill([]) as T[][];
    cols.forEach((_, x) => (cols[x] = new Array(this.rows.length)));
    this.rows.forEach((row, y) => row.forEach((value, x) => (cols[x][y] = value)));
    return cols;
  }

  get hash() {
    return this.rows.map((row) => row.join("")).join("\n");
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

  print(spacing = 1) {
    this.forEach(({ x, y }, value) => {
      let valueStr = value + "";
      process.stdout.write(padSpaces(valueStr, spacing));
      if (x === this.width - 1) process.stdout.write(` ${y}\n`);
    });
  }

  isEqualTo(other: Map2D<T>) {
    if (this.width !== other.width || this.height !== other.height) return false;
    return !this.some((node, value) => value !== other.get(node));
  }

  rotateLeft(times = 1) {
    for (let i = 0; i < times; i++) {
      this.nodes = this.cols.reverse();
    }
  }

  rotateRight(times = 1) {
    for (let i = 0; i < times; i++) {
      this.nodes = this.cols.map((col) => col.reverse());
    }
  }

  clone() {
    return new Map2D(this.nodes.map((row) => row.slice()));
  }
}

function padSpaces(n: any, length: number) {
  const nStr = n.toString();
  return " ".repeat(length - nStr.length) + nStr;
}
