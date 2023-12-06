export default async function run(input: string) {
  const [timeString, distanceString] = input.split("\n");
  const times = timeString
    .split(":")[1]
    .split(" ")
    .filter((s) => s !== "")
    .map((s) => Number.parseInt(s));
  const distances = distanceString
    .split(":")[1]
    .split(" ")
    .filter((s) => s !== "")
    .map((s) => Number.parseInt(s));

  if (times.length !== distances.length) throw new RangeError(`Times and distances do not match!`);
  const winCounts = new Array(times.length);
  for (let i = 0; i < times.length; i++) {
    const timeLimit = times[i];
    const record = distances[i];

    // get the lower and upper threshold for pressing the button to win (intersection with record)
    const intersections = getCurveIntersections(record, timeLimit);
    const [lowerLimit, upperLimit] = intersections.map((n) => Math.ceil(n));
    winCounts[i] = upperLimit - lowerLimit;
  }
  return winCounts.reduce((prod, wins) => prod * wins, 1);
}

function getCurveIntersections(c: number, minusB: number) {
  const root = Math.sqrt(minusB * minusB - 4 * c);
  return [(minusB - root) / 2, (minusB + root) / 2]; // use quadratic formula
}
