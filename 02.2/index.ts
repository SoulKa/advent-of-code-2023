declare type Color = "red" | "blue" | "green";
declare type Bag = {
  red: number;
  blue: number;
  green: number;
};

export default async function run(input: string) {
  let sum = 0;

  for (let line of input.split("\n")) {
    const match = /^Game ([0-9]+):/.exec(line);
    if (match == null || match[1] == null) continue;
    const id = Number.parseInt(match[1]);
    let valid = true;
    line = line.split(":")[1];

    const bag: Bag = { red: 0, blue: 0, green: 0 };
    for (const bagString of line.split(";")) {
      for (const diceString of bagString.split(",").map((s) => s.trim())) {
        const [numString, color] = diceString.split(" ") as [string, Color];
        const num = Number.parseInt(numString);
        bag[color] = Math.max(bag[color], num);
      }
    }

    sum += Object.values(bag).reduce((pow, n) => pow * n, 1);
  }

  // return sum
  return sum;
}
