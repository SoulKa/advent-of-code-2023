import Map2D from "./map2d";
import Node from "./node";

declare type Element = "." | "#" | "O";
const HASH_TO_ITERATION = new Map<string, number>();
const CACHE = new Map<number, Map2D<Element>>();

export default async function run(input: string) {
  const lines = input.trim().split("\n");

  lines.splice(0, 0, "#".repeat(lines[0].length));
  lines.push("#".repeat(lines[0].length));
  let map = new Map2D(lines.map((line) => ("#" + line + "#").split("") as Element[]));
  map.rotateLeft();
  cache(map, 0);

  map = iterate(map, 1000000000);
  const weight = getWeight(map);

  // make sure we're back to the original orientation
  map.rotateRight();
  map.print();
  return weight;
}

function iterate(map: Map2D<Element>, numIterations: number) {
  for (let iteration = 1; iteration <= numIterations; ) {
    console.log("iteration:", iteration);
    for (let i = 0; i < 4; i++) {
      pullLeft(map);
      map.rotateRight();
    }

    if (getWeight(map) === 64) {
      console.log("found 64 at iteration:", iteration);
    }

    // Check if we've seen this map before
    const cachedIteration = cache(map, iteration);
    if (cachedIteration === null) {
      iteration++;
    } else {
      const loopLength = iteration - cachedIteration;
      const remainingIterations = numIterations - iteration;
      const sameMapIteration = cachedIteration + (remainingIterations % loopLength);
      console.log("loop detected, returning to iteration:", sameMapIteration);
      return CACHE.get(sameMapIteration)!;
    }
  }

  return map;
}

function cache(map: Map2D<Element>, iteration: number) {
  const { hash } = map;
  if (HASH_TO_ITERATION.has(hash)) {
    return HASH_TO_ITERATION.get(hash)!;
  } else {
    HASH_TO_ITERATION.set(hash, iteration);
    CACHE.set(iteration, map.clone());
    return null;
  }
}

function pullLeft(map: Map2D<Element>) {
  map.rows.forEach((row, y) => {
    let numRoundRocks = 0;
    let lastRock = 0;
    row.forEach((value, x) => {
      if (value === "O") {
        numRoundRocks++;
      } else if (value === "#") {
        for (let xTmp = lastRock + 1; xTmp < x; xTmp++) {
          map.set(new Node([xTmp, y]), xTmp <= lastRock + numRoundRocks ? "O" : ".");
        }
        numRoundRocks = 0;
        lastRock = x;
      }
    });
  });
}

function getWeight(map: Map2D<Element>) {
  let weight = 0;
  map.forEach((node, value) => {
    if (value === "O") {
      weight += map.width - node.x - 1;
    }
  });
  return weight;
}
