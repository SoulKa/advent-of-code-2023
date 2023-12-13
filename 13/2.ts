import { getSymmetrySum, parseInput } from "./shared";

declare type Material = "#" | ".";

export default async function run(input: string) {
  return parseInput(input).reduce((sum, map) => sum + getSymmetrySum(map, 1) - getSymmetrySum(map, 0), 0);
}
