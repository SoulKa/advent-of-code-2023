import { SparseMap } from "./ranges";
declare type MapType =
  | "seed-to-soil"
  | "soil-to-fertilizer"
  | "fertilizer-to-water"
  | "water-to-light"
  | "light-to-temperature"
  | "temperature-to-humidity"
  | "humidity-to-location";

declare type CustomMapType = "seed-to-location";

const MAP_TYPES = [
  "seed-to-soil",
  "soil-to-fertilizer",
  "fertilizer-to-water",
  "water-to-light",
  "light-to-temperature",
  "temperature-to-humidity",
  "humidity-to-location",
] as MapType[];

let SEEDS = new Set<number>();
const MAPS = {} as { [K in MapType]: SparseMap };
const CUSTOM_MAPS = {} as { [K in CustomMapType]: SparseMap };

export default async function run(input: string) {
  let map = new SparseMap();

  // parse input
  for (const line of input.split("\n")) {
    if (line.trim() === "") continue;

    if (line.startsWith("seeds")) {
      SEEDS = new Set(
        line
          .split(":")[1]
          .trim()
          .split(" ")
          .map((s) => Number.parseInt(s))
      );
    } else if (line.endsWith(":")) {
      map = new SparseMap();
      MAPS[line.substring(0, line.length - 5) as MapType] = map;
    } else {
      const [dest, src, length] = line.split(" ").map((s) => Number.parseInt(s));
      map.addMapping(src, dest, length);
    }
  }

  // get locations of seeds
  CUSTOM_MAPS["seed-to-location"] = new SparseMap();
  let minLocation = Number.POSITIVE_INFINITY;
  for (const seed of SEEDS) {
    let dest = seed;
    for (const mapType of MAP_TYPES) {
      const map = getMap(mapType);
      dest = map.get(dest);
    }
    CUSTOM_MAPS["seed-to-location"].addMapping(seed, dest, 1);
    minLocation = Math.min(minLocation, dest);
  }
  return minLocation;
}

function getMap(mapType: MapType) {
  return MAPS[mapType];
}
