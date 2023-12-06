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
  const winCounts = new Array(times.length).fill(0);
  for (let i = 0; i < times.length; i++) {
    const timeLimit = times[i];
    const record = distances[i];
    for (let tButton = 1; tButton < timeLimit; tButton++) {
      const distance = getDistanceForButtonPress(tButton, timeLimit);
      console.log(distance, record);
      if (distance > record) winCounts[i]++;
    }
  }
  return winCounts.reduce((prod, wins) => prod * wins, 1);
}

function getDistanceForButtonPress(holdTime: number, raceTime: number) {
  return (raceTime - holdTime) * holdTime;
}
