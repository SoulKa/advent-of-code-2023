declare type Node = [number, number];
declare type SpaceObject = "." | "#";

export default async function run(input: string) {
  const rows = input.split("\n").map((line) => line.split("") as SpaceObject[]);
  const emptyRows = new Set(rows.map((_, y) => y));
  const emptyCols = new Set(rows[0].map((_, x) => x));

  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      if (rows[y][x] === "#") {
        emptyRows.delete(y);
        emptyCols.delete(x);
      }
    }
  }

  const galaxies = [] as Galaxy[];
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      if (rows[y][x] === "#") {
        galaxies.push(new Galaxy(galaxies.length + 1, [x + getWarp(emptyCols, x), y + getWarp(emptyRows, y)]));
      }
    }
  }

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

function getWarp(emptyLines: Set<number>, position: number) {
  let warp = 0;
  for (let x = 0; x < position; x++) {
    if (emptyLines.has(x)) warp += 999999;
  }
  return warp;
}

class Galaxy {
  constructor(public readonly id: number, public readonly location: Node) {}

  distanceTo(other: Galaxy) {
    return Math.abs(this.location[0] - other.location[0]) + Math.abs(this.location[1] - other.location[1]);
  }
}
