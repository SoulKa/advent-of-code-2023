export default async function run(input: string) {
  const [timeString, distanceString] = input.split("\n");
  const timeLimit = Number.parseInt(timeString.split(":")[1].replace(/\s/g, ""));
  const record = Number.parseInt(distanceString.split(":")[1].replace(/\s/g, ""));

  // get the lower and upper threshold for pressing the button to win (intersection with record)
  const intersections = getCurveIntersections(record, timeLimit);
  const [lowerLimit, upperLimit] = intersections.map((n) => Math.ceil(n)).sort();
  return upperLimit - lowerLimit;
}

function getCurveIntersections(c: number, minusB: number) {
  const root = Math.sqrt(minusB * minusB - 4 * c);
  return [(minusB + root) / 2, (minusB - root) / 2]; // use quadratic formula
}
