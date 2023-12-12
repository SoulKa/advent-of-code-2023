export default class Node {
  public readonly x: number;
  public readonly y: number;

  constructor(raw: [number, number]) {
    this.x = raw[0];
    this.y = raw[1];
  }
}
