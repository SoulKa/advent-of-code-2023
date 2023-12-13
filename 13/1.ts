import Map2D from "./map2d";

declare type Material = "#" | ".";

export default async function run(input: string) {
  const maps = parseInput(input);

  let sum = 0;
  for (const map of maps) {
    const rows = map.rows;
    let symmetryAxis = findSymmetryAxis(rows);
    if (symmetryAxis !== undefined) {
      sum += symmetryAxis * 100;
      continue;
    }

    const cols = map.cols;
    symmetryAxis = findSymmetryAxis(cols);
    if (symmetryAxis !== undefined) {
      sum += symmetryAxis;
      continue;
    }
    throw new Error("No symmetry axis found");
  }

  return sum;
}

function parseInput(input: string) {
  if (!input.endsWith("\n")) input += "\n";

  let rows = [] as Material[][];
  const maps = [] as Map2D<Material>[];
  for (const line of input.split("\n")) {
    if (line === "") {
      maps.push(new Map2D(rows));
      rows = [];
    } else {
      rows.push(line.split("") as Material[]);
    }
  }
  return maps;
}

function findSymmetryAxis<T>(rows: T[][]) {
  for (let y = 1; y < rows.length; y++) {
    if (symmetryExists(rows.slice(0, y).reverse(), rows.slice(y))) return y;
  }
}

function symmetryExists<T>(a: T[][], b: T[][]) {
  for (let y = 0; y < Math.min(a.length, b.length); y++) {
    if (!vectorsMatch(a[y], b[y])) return false;
  }
  return true;
}

function vectorsMatch<T>(a: T[], b: T[]) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
