import Map2D from "./map2d";

declare type Element = "." | "#" | "O";

export default async function run(input: string) {
  const lines = input.trim().split("\n").reverse();

  lines.splice(0, 0, "#".repeat(lines[0].length));
  lines.push("#".repeat(lines[0].length));
  const map = new Map2D(lines.map((line) => line.split("") as Element[]));

  let weight = 0;
  map.print();

  const { cols } = map;
  cols.forEach((col, x) => {
    let numRoundRocks = 0;
    let lastRock = 0;
    for (let y = col.length - 1; y >= 0; y--) {
      if (col[y] === "O") {
        numRoundRocks++;
      } else if (col[y] === "#") {
        for (let i = 0; i < numRoundRocks; i++) {
          weight += lastRock - i - 1;
        }
        numRoundRocks = 0;
        lastRock = y;
      }
    }
  });
  return weight;
}
