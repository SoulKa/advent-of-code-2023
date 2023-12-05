import { Range, SparseMap } from "./ranges";
declare type MapType =
  | "seed-to-soil"
  | "soil-to-fertilizer"
  | "fertilizer-to-water"
  | "water-to-light"
  | "light-to-temperature"
  | "temperature-to-humidity"
  | "humidity-to-location";

const MAP_TYPES = [
  "seed-to-soil",
  "soil-to-fertilizer",
  "fertilizer-to-water",
  "water-to-light",
  "light-to-temperature",
  "temperature-to-humidity",
  "humidity-to-location",
] as MapType[];

let SEED_RANGES = [] as Range[];
const MAPS = {} as { [K in MapType]: SparseMap };

export default async function run(input: string) {
  let map = new SparseMap();

  // parse input
  for (const line of input.split("\n")) {
    if (line.trim() === "") continue;

    if (line.startsWith("seeds")) {
      const seedValues = line
        .split(":")[1]
        .trim()
        .split(" ")
        .map((s) => Number.parseInt(s));
      for (let i = 0; i < seedValues.length; i += 2) {
        const length = seedValues[i] + seedValues[i + 1] - 1;
        if (length <= 0) throw new RangeError(`Seed range is smaller than 1: ${length}`);
        SEED_RANGES.push(new Range(seedValues[i], length));
      }
    } else if (line.endsWith(":")) {
      map = new SparseMap();
      MAPS[line.substring(0, line.length - 5) as MapType] = map;
    } else {
      const [dest, src, length] = line.split(" ").map((s) => Number.parseInt(s));
      map.addMapping(src, dest, length);
    }
  }

  // apply seed range to seed to soil map
  {
    const seedMap = new SparseMap();
    for (const seedRange of SEED_RANGES) {
      seedMap.addMapping(seedRange.start, seedRange.start, seedRange.length);
    }
    MAPS["seed-to-soil"] = seedMap.buildCombinedMap(getMap("seed-to-soil"));
  }

  // combine maps
  let seedToLocationMapping = getMap("seed-to-soil");
  for (const mapType of MAP_TYPES) {
    if (mapType === "seed-to-soil") continue;
    seedToLocationMapping = seedToLocationMapping.buildCombinedMap(getMap(mapType));
  }

  // get min location
  let minLocation = Number.POSITIVE_INFINITY;
  for (const mapping of seedToLocationMapping.mappings) {
    minLocation = Math.min(mapping.dest, minLocation);
  }
  return minLocation;
}

function getMap(mapType: MapType) {
  return MAPS[mapType];
}
