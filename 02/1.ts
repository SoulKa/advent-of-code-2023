declare type Color = "red" | "blue" | "green";
declare type Bag = {
  red: number;
  blue: number;
  green: number;
};

const DICE_COLLECTION: Bag = { red: 12, green: 13, blue: 14 };

export default async function run(input: string) {
  let sum = 0;

  for (let line of input.split("\n")) {
    const match = /^Game ([0-9]+):/.exec(line);
    if (match == null || match[1] == null) continue;
    const id = Number.parseInt(match[1]);
    let valid = true;
    line = line.split(":")[1];

    for (const bagString of line.split(";")) {
      const bag: Bag = { red: 0, green: 0, blue: 0 };
      for (const diceString of bagString.split(",").map((s) => s.trim())) {
        const [numString, color] = diceString.split(" ") as [string, Color];
        const num = Number.parseInt(numString);
        bag[color] = Math.max(bag[color], num);
      }

      // check if bag is valid
      if (Object.entries(bag).some(([color, amount]) => DICE_COLLECTION[color as Color] < amount)) {
        valid = false;
        break;
      }
    }

    if (valid) sum += id;
  }

  // return sum
  return sum;
}
