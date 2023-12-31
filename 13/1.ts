import { getSymmetrySum, parseInput } from "./shared";

declare type Material = "#" | ".";

export default async function run(input: string) {
  return parseInput(input).reduce((sum, map) => sum + getSymmetrySum(map), 0);
}
