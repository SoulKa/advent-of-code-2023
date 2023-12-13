import Map2D from "./map2d";

declare type Material = "#" | ".";

export function getSymmetrySum<T>(map: Map2D<T>, threshold = 0) {
  return getSymmtrySumFromRows(map.rows, threshold) * 100 + getSymmtrySumFromRows(map.cols, threshold);
}

function getSymmtrySumFromRows<T>(rows: T[][], threshold = 0) {
  return findSymmetryAxes(rows, threshold).reduce((axis, sum) => sum + axis, 0);
}

export function parseInput(input: string) {
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

function findSymmetryAxes<T>(rows: T[][], threshold = 0) {
  let axes = [] as number[];
  for (let y = 1; y < rows.length; y++) {
    if (vectorsMatch(rows.slice(0, y).reverse(), rows.slice(y), threshold)) axes.push(y);
  }
  return axes;
}

function vectorsMatch<T>(a: T[][], b: T[][], threshold = 0) {
  let delta = 0;
  for (let y = 0; y < Math.min(a.length, b.length); y++) {
    delta += differenceCount(a[y], b[y]);
    if (delta > threshold) return false;
  }
  return true;
}

function differenceCount<T>(a: T[], b: T[]) {
  if (a.length !== b.length) throw new Error("Vectors must be same length");
  let delta = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) delta++;
  }
  return delta;
}
