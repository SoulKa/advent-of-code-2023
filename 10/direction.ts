import Node from "./node";

export default class Direction {
  public readonly x: number;
  public readonly y: number;

  constructor(raw: [number, number]) {
    this.x = raw[0];
    this.y = raw[1];
  }

  static LEFT = new Direction([-1, 0]);
  static DOWN = new Direction([0, 1]);
  static UP = new Direction([0, -1]);
  static RIGHT = new Direction([1, 0]);
  static DIRECTIONS = [Direction.LEFT, Direction.RIGHT, Direction.UP, Direction.DOWN];

  static fromNodes(first: Node, second: Node) {
    return new Direction([second.x - first.x, second.y - first.y]);
  }

  equalTo(other: Direction) {
    return this.x === other.x && this.y === other.y;
  }
}
