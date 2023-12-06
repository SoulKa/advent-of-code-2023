// DISCLAIMER: I AM SORRY FOR THE BRUTE FORCE METHOD :D

export default async function run(input: string) {
  const [timeString, distanceString] = input.split("\n");
  const timeLimit = Number.parseInt(timeString.split(":")[1].replace(/\s/g, ""));
  const record = Number.parseInt(distanceString.split(":")[1].replace(/\s/g, ""));

  let winCounts = 0;
  for (let tButton = 1; tButton < timeLimit; tButton++) {
    const distance = getDistanceForButtonPress(tButton, timeLimit);
    if (distance > record) winCounts++;
  }
  return winCounts;
}

function getDistanceForButtonPress(holdTime: number, raceTime: number) {
  return (raceTime - holdTime) * holdTime;
}
